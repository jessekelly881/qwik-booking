import {
	$,
	type QRL,
	type Signal,
	component$,
	useSignal,
} from "@builder.io/qwik";
import {
	type DocumentHead,
	Link,
	routeLoader$,
	server$,
	useLocation,
} from "@builder.io/qwik-city";
import { Schema } from "@effect/schema";
import { Effect, Exit, Option, Struct } from "effect";
import * as Api from "~/api";
import { BookingResponse, getBooking } from "~/api";
import { CancelledBadge, PaidBadge } from "~/components/badges";
import { DataPoint } from "~/components/router-head/data-point";
import { formatTotal, totalAsFloat } from "~/utils";

const cancelBooking = server$(async (id: number, notes: string) => {
	await Effect.runPromise(Api.cancelBooking(id, notes));
	console.log(`id: ${id}, notes: ${notes}`);
});

export const useBookings = routeLoader$(async (requestEvent) => {
	const id = Number.parseInt(requestEvent.params.id); // todo! - this is lazy and can throw
	const exit = await Effect.runPromiseExit(getBooking(id));
	if (Exit.isSuccess(exit)) {
		return exit.value;
	}

	return requestEvent.fail(404, {
		errorMessage: "Error loading booking",
	});
});

namespace CancelDialog {
	export interface Props {
		notesSignal: Signal<string>;
		show: Signal<boolean>;
		onConfirm: QRL<() => void>;
	}
}

const CancelDialog = component$((props: CancelDialog.Props) => (
	<div>
		<h3>Do you wish to cancel?</h3>
		<input
			class="text-white px-2 py-1 bg-zinc-700"
			bind:value={props.notesSignal}
			value={props.notesSignal.value}
		/>
		<div class="flex flex-row gap-4">
			<button
				onClick$={$(() => props.onConfirm())}
				type="button"
				class="px-4 py-2 bg-green-400"
			>
				Confirm
			</button>
			<button
				// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
				onClick$={() => (props.show.value = false)}
				type="button"
				class="px-4 py-2 bg-red-400"
			>
				Abort
			</button>
		</div>
	</div>
));

export default component$(() => {
	const signal = useBookings();
	const showCancelModal = useSignal(false);
	const notes = useSignal("");
	const r = useLocation();
	const id = Number.parseInt(r.params?.id);

	if (signal.value.errorMessage) {
		return <span>{signal.value.errorMessage}</span>;
	}

	const booking = Schema.decodeUnknownSync(BookingResponse)(
		Struct.omit("errorMessage")(signal.value),
	);

	const onCancel = $(async () => await cancelBooking(id, notes.value));

	return (
		<div class="p-8 flex flex-col">
			{booking.id}
			{showCancelModal.value && (
				<CancelDialog
					onConfirm={onCancel}
					show={showCancelModal}
					notesSignal={notes}
				/>
			)}
			{Option.isNone(booking.cancelledAt) ? (
				// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
				<button onClick$={() => (showCancelModal.value = true)} type="button">
					Cancel
				</button>
			) : (
				false
			)}
			<Link href="/bookings" class="text-blue-400 hover:underline">
				All bookings
			</Link>
			<br />
			<h1 class="text-xl">{booking.hotel.name}</h1>
			<span class="text-sm text-zinc-500 whitespace-nowrap">
				{Option.map(booking.checkInDate, (checkIn) =>
					checkIn.toDateString(),
				).pipe(Option.getOrUndefined)}{" "}
				-{" "}
				{Option.map(booking.checkOutDate, (checkOut) =>
					checkOut.toDateString(),
				).pipe(Option.getOrUndefined)}
			</span>
			<div class="flex flex-row gap-2">
				{Option.map(booking.paidInFullAt, () => <PaidBadge />).pipe(
					Option.getOrUndefined,
				)}
				{Option.map(booking.cancelledAt, () => <CancelledBadge />).pipe(
					Option.getOrUndefined,
				)}
			</div>
			<br />
			<h2 class="text-zinc-300">Room</h2>
			<br />
			<div class="flex flex-row gap-4">
				<DataPoint
					title="Price"
					value={formatTotal(
						totalAsFloat(booking.total, booking.currencyCode),
						booking.currencyCode,
					)}
				/>
				<DataPoint title="Max units" value={booking.room.maxUnits.toString()} />
				<DataPoint
					title="Max occupancy"
					value={booking.room.maxOccupancy.toString()}
				/>
			</div>
			<br />
			<br />
			<div>
				<h2 class="text-zinc-300">Customer</h2>
				<br />
				<div class="flex flex-row gap-4">
					<DataPoint
						title="Name"
						value={[booking.customer.firstName, booking.customer.lastName].join(
							" ",
						)}
					/>
					<DataPoint title="Email" value={booking.customer.email} />
					<DataPoint
						title="Number of bookings"
						value={booking.customer.bookingIds.length.toString()}
					/>
				</div>
			</div>
			<br />
			{Option.map(booking.notes, (notes) => (
				<div>
					<span class="text-sm text-zinc-500">Notes</span>
					<span>{notes}</span>
				</div>
			)).pipe(Option.getOrElse(() => false))}
			<br />
		</div>
	);
});

export const head: DocumentHead = {
	title: "Bookings",
};
