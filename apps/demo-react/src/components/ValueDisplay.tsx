import type { CircaValue } from "@circa-input/react";

interface ValueDisplayProps {
  value: CircaValue | null;
  label?: string;
}

export function ValueDisplay({
  value,
  label = "CircaValue",
}: ValueDisplayProps) {
  return (
    <div className="value-display">
      <div className="value-display-label">{label}</div>
      {value === null || value.value === null ? (
        <pre className="value-display-content">未設定</pre>
      ) : (
        <pre className="value-display-content">
          {JSON.stringify(
            {
              value: value.value,
              marginLow: value.marginLow,
              marginHigh: value.marginHigh,
              distribution: value.distribution,
            },
            null,
            2,
          )}
        </pre>
      )}
    </div>
  );
}
