import type { WheelEvent } from "react";

export function blurNumberInputOnWheel(
  event: WheelEvent<HTMLInputElement>,
) {
  event.currentTarget.blur();
}
