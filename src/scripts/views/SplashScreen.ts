import {delay, ensure} from "../lib/util.ts";

export default async function (): Promise<void> {
    const el = ensure(document.getElementById("splash-screen"));
    await delay(1000);
    el.classList.add("fade-out");
    await delay(300);
    el.remove();
}