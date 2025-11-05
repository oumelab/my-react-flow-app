import {useMemo} from "react";

// ショートカットキー（Mac, iPad なら ⌘ , それ以外は Ctrl)
export function usePlatform() {
  const isMac = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      /(Mac|iPad)/i.test(navigator.userAgent),
    []
  );
  const modKey = isMac ? "⌘" : "Ctrl";
  const modKeyName = isMac ? "コマンドキー" : "コントロールキー";
  return {isMac, modKey, modKeyName};
}
