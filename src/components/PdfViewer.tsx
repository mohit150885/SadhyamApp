import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { WebView as RNWebView } from "react-native-webview";

import { Lock } from "lucide-react-native";
import { apiFetch, bytesToBase64, idToken } from "@/lib/api";
import { WEBSITE_URL } from "@/lib/config";
import { slate, useTheme } from "@/lib/theme";
import { Btn, EmptyState, T } from "./ui";

// react-native-webview's typings don't line up with React Native 0.88's strict types yet,
// so the few props used here are described explicitly.
type WebViewMessageEvent = { nativeEvent: { data: string } };
type WebViewHandle = { injectJavaScript: (js: string) => void };
type WebViewLike = React.ComponentType<{
    ref?: React.Ref<WebViewHandle>;
    originWhitelist?: string[];
    source: { html: string; baseUrl?: string };
    onMessage?: (e: WebViewMessageEvent) => void;
    javaScriptEnabled?: boolean;
    setSupportMultipleWindows?: boolean;
    allowsLinkPreview?: boolean;
    textInteractionEnabled?: boolean;
    style?: object;
    onShouldStartLoadWithRequest?: (r: { url: string }) => boolean;
}>;
const WebView = RNWebView as unknown as WebViewLike;

/*
 * Reads a protected PDF served by the website in ~900 KB parts
 * (/api/my/material/<id> or /api/attempts/<id>/solution-file).
 * The parts are downloaded with the student's token, handed to a local
 * pdf.js page inside a WebView and drawn page by page with the student's
 * email as a watermark — the same protection as the website reader.
 * Only the PDF viewer runs in the WebView; no website pages are loaded.
 */

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";

const html = (watermark: string, brand: string) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4, user-scalable=yes">
<style>
  html,body{margin:0;background:#e2e8f0;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
  #pages{padding:10px 8px 40px}
  .page{position:relative;margin:0 auto 12px;background:#fff;box-shadow:0 2px 10px rgba(15,23,42,.12);border-radius:4px;overflow:hidden}
  .page canvas{display:block;width:100%;height:auto}
  .wm{position:absolute;inset:0;pointer-events:none;display:flex;flex-wrap:wrap;align-content:space-around;justify-content:space-around;opacity:.09;transform:rotate(-28deg) scale(1.4)}
  .wm span{font:700 14px sans-serif;color:#0f172a;padding:18px 10px;white-space:nowrap}
  .ph{display:flex;align-items:center;justify-content:center;color:#94a3b8;font:600 13px sans-serif}
  #err{display:none;padding:40px 20px;text-align:center;font:600 15px sans-serif;color:#b91c1c}
  .num{position:absolute;right:8px;bottom:6px;font:700 11px sans-serif;color:#fff;background:${brand};border-radius:8px;padding:2px 7px}
</style>
<script src="${PDFJS}/pdf.min.js"></script>
</head><body oncontextmenu="return false">
<div id="pages"></div><div id="err"></div>
<script>
  var chunks=[], WM=${JSON.stringify(watermark)};
  function post(o){ window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(o)); }
  window.__chunk=function(i,b64){ chunks[i]=b64; };
  window.__open=async function(){
    try{
      pdfjsLib.GlobalWorkerOptions.workerSrc='${PDFJS}/pdf.worker.min.js';
      var parts=chunks.map(function(b){ var s=atob(b), u=new Uint8Array(s.length); for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i); return u; });
      var len=parts.reduce(function(a,p){return a+p.length},0), all=new Uint8Array(len), o=0;
      parts.forEach(function(p){ all.set(p,o); o+=p.length; }); chunks=[];
      var doc=await pdfjsLib.getDocument({data:all}).promise;
      post({type:'opened',pages:doc.numPages});
      var box=document.getElementById('pages'), W=box.clientWidth-16;
      var first=await doc.getPage(1), vp0=first.getViewport({scale:1});
      var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var el=e.target; post({type:'page',n:+el.dataset.n}); if(!el.dataset.done){ el.dataset.done=1; draw(el); } } }); },{rootMargin:'600px 0px'});
      for(var n=1;n<=doc.numPages;n++){
        var d=document.createElement('div'); d.className='page ph'; d.dataset.n=n;
        d.style.width=W+'px'; d.style.height=Math.round(W*vp0.height/vp0.width)+'px'; d.textContent='Page '+n;
        box.appendChild(d); io.observe(d);
      }
      async function draw(el){
        var p=await doc.getPage(+el.dataset.n), vp=p.getViewport({scale:1}), s=(W/vp.width)*Math.min(3,(window.devicePixelRatio||2));
        var v=p.getViewport({scale:s}), c=document.createElement('canvas'); c.width=v.width; c.height=v.height;
        await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;
        el.textContent=''; el.className='page'; el.style.height='auto'; el.appendChild(c);
        if(WM){ var w=document.createElement('div'); w.className='wm'; for(var k=0;k<24;k++){ var sp=document.createElement('span'); sp.textContent=WM; w.appendChild(sp);} el.appendChild(w); }
        var nb=document.createElement('div'); nb.className='num'; nb.textContent=el.dataset.n; el.appendChild(nb);
      }
    }catch(e){ var er=document.getElementById('err'); er.style.display='block'; er.textContent='Could not open the PDF. '+(e&&e.message||''); post({type:'error',message:String(e&&e.message||e)}); }
  };
  post({type:'ready'});
</script></body></html>`;

export function PdfViewer({ endpoint, watermark, onPage }: { endpoint: string; watermark: string; onPage?: (page: number, total: number) => void }) {
    const theme = useTheme();
    const web = useRef<WebViewHandle>(null);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<"download" | "render" | "open" | "error">("download");
    const [error, setError] = useState<{ text: string; locked?: boolean } | null>(null);
    const [attempt, setAttempt] = useState(0);
    const total = useRef(0);

    const load = useCallback(async () => {
        try {
            setPhase("download");
            setProgress(0);
            const meta = await apiFetch<{ name: string; size: number; chunks: number }>(endpoint, { auth: true });
            const token = await idToken();
            const n = Math.max(1, Number(meta.chunks) || 1);
            for (let i = 0; i < n; i++) {
                const sep = endpoint.includes("?") ? "&" : "?";
                const res = await fetch(`${WEBSITE_URL}${endpoint}${sep}part=${i}`, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error(`Download failed (${res.status})`);
                const b64 = bytesToBase64(new Uint8Array(await res.arrayBuffer()));
                web.current?.injectJavaScript(`window.__chunk(${i}, ${JSON.stringify(b64)}); true;`);
                setProgress((i + 1) / n);
            }
            setPhase("render");
            web.current?.injectJavaScript("window.__open(); true;");
        } catch (e) {
            const text = e instanceof Error ? e.message : "Could not open this PDF";
            setError({ text, locked: /buy|403/i.test(text) });
            setPhase("error");
        }
    }, [endpoint]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- starts the download once the viewer page is ready
        if (ready) void load();
    }, [ready, load, attempt]);

    const onMessage = (e: WebViewMessageEvent) => {
        try {
            const m = JSON.parse(e.nativeEvent.data) as { type: string; pages?: number; n?: number; message?: string };
            if (m.type === "ready") setReady(true);
            else if (m.type === "opened") {
                total.current = m.pages ?? 0;
                setPhase("open");
                onPage?.(1, total.current);
            } else if (m.type === "page" && m.n) onPage?.(m.n, total.current);
            else if (m.type === "error") {
                setError({ text: m.message || "Could not open the PDF" });
                setPhase("error");
            }
        } catch {
            /* ignore */
        }
    };

    if (error)
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: slate[50] }}>
                <EmptyState
                    icon={<Lock size={40} color={slate[300]} />}
                    title={error.locked ? "Buy this to read it" : "Can't open the PDF"}
                    description={error.text}
                    action={
                        !error.locked ? (
                            <Btn
                                variant="outline"
                                title="Try again"
                                onPress={() => {
                                    setError(null);
                                    setReady(false);
                                    setAttempt((a) => a + 1);
                                }}
                            />
                        ) : undefined
                    }
                />
            </View>
        );

    return (
        <View style={{ flex: 1, backgroundColor: slate[200] }}>
            <WebView
                key={attempt}
                ref={web}
                originWhitelist={["*"]}
                source={{ html: html(watermark, theme.brand), baseUrl: "https://localhost/" }}
                onMessage={onMessage}
                javaScriptEnabled
                setSupportMultipleWindows={false}
                allowsLinkPreview={false}
                textInteractionEnabled={false}
                style={{ flex: 1, backgroundColor: slate[200] }}
                onShouldStartLoadWithRequest={(r) => r.url.startsWith("https://localhost") || r.url.startsWith("about:")}
            />
            {phase !== "open" ? (
                <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: slate[50], padding: 30 }}>
                    <T w="black" size={17} color={slate[900]}>
                        {phase === "render" ? "Preparing pages…" : "Opening PDF…"}
                    </T>
                    <T w="semibold" size={13} color={slate[500]} style={{ marginTop: 4 }}>
                        {Math.round(progress * 100)}%
                    </T>
                    <View style={{ width: 220, height: 8, borderRadius: 4, backgroundColor: slate[200], marginTop: 12, overflow: "hidden" }}>
                        <View style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: theme.brand }} />
                    </View>
                </View>
            ) : null}
        </View>
    );
}
