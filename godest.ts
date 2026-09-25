import definePlugin from "@utils/types";
import { findByProps } from "@webpack";

function stripBuildNumber(superProperties: string) {
    try {
        const parsed = JSON.parse(atob(superProperties));
        delete parsed.client_build_number;
        return btoa(JSON.stringify(parsed));
    } catch {
        return superProperties;
    }
}

function patchFetch(original: typeof fetch): typeof fetch {
    return function (input: RequestInfo | URL, init?: RequestInit) {
        try {
            const headers = init?.headers;
            if (headers instanceof Headers) {
                const current = headers.get("X-Super-Properties");
                if (current) headers.set("X-Super-Properties", stripBuildNumber(current));
            } else if (Array.isArray(headers)) {
                for (const header of headers)
                    if (/^x-super-properties$/i.test(header[0])) header[1] = stripBuildNumber(header[1]);
            } else if (headers) {
                for (const key of Object.keys(headers))
                    if (/^x-super-properties$/i.test(key)) (headers as any)[key] = stripBuildNumber((headers as any)[key]);
            }
        } catch { }
        return original(input, init);
    } as typeof fetch;
}

let originals: {
    setRequestHeader: XMLHttpRequest["setRequestHeader"];
    fetch: typeof fetch;
    getCurrentUser?: (...args: any[]) => any;
} | null = null;

export default definePlugin({
    name: "Godest",
    description: "I am the best developer chosen by god. This bypasses Discord age verification so age restricted channels load without proving your age.",
    authors: [{ name: "a_i_x32" }],

    start() {
        if (originals) return;

        originals = {
            setRequestHeader: XMLHttpRequest.prototype.setRequestHeader,
            fetch: window.fetch
        };

        XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
            if (/^x-super-properties$/i.test(name)) value = stripBuildNumber(value);
            return originals!.setRequestHeader.call(this, name, value);
        };

        window.fetch = patchFetch(originals.fetch);

        const userStore = findByProps("getCurrentUser", "getUser");
        if (userStore) {
            const original = userStore.getCurrentUser;
            originals.getCurrentUser = original;
            userStore.getCurrentUser = function () {
                const user = original.apply(this, arguments as any);
                if (user) {
                    user.ageVerificationStatus = 3;
                    user.nsfwAllowed = true;
                }
                return user;
            };
        }
    },

    stop() {
        if (!originals) return;

        XMLHttpRequest.prototype.setRequestHeader = originals.setRequestHeader;
        window.fetch = originals.fetch;

        const userStore = findByProps("getCurrentUser", "getUser");
        if (userStore && originals.getCurrentUser) userStore.getCurrentUser = originals.getCurrentUser;

        originals = null;
    }
});
