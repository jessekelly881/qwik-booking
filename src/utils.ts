import { Match } from "effect";
import type { CurrencyCode } from "~/api";

export function totalAsFloat(total: number, currency: CurrencyCode) {
	return Match.value(currency).pipe(
		Match.when("USD", () => total / 100),
		Match.exhaustive,
	);
}

export function formatTotal(total: number, currencyCode: CurrencyCode) {
	return Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currencyCode,
	}).format(total);
}
