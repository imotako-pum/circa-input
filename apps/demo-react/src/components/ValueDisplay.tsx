import type { CircaValue } from "@circa-input/react";
import { useT } from "../i18n";

interface ValueDisplayProps {
  value: CircaValue | null;
  label?: string;
}

export function ValueDisplay({
  value,
  label = "CircaValue",
}: ValueDisplayProps) {
  const t = useT();

  return (
    <div className="value-display">
      <div className="value-display-label">{label}</div>
      {value === null || value.value === null ? (
        <pre className="value-display-content">{t("common.unset")}</pre>
      ) : (
        <pre className="value-display-content">
          {JSON.stringify(
            {
              value: value.value,
              marginLow: value.marginLow,
              marginHigh: value.marginHigh,
              distribution: value.distribution,
              ...(value.distributionParams.gradient && {
                distributionParams: value.distributionParams,
              }),
            },
            null,
            2,
          )}
        </pre>
      )}
    </div>
  );
}
