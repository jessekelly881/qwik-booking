import { component$ } from "@builder.io/qwik";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { BookingsResponse, getBookings } from "~/api";
import { BookingCard } from "~/components/booking-card";

export const useBookings = routeLoader$(async () => {
	const bookings = await Effect.runPromise(getBookings);
	return bookings;
});

export default component$(() => {
	const signal = useBookings();
	const bookings = Schema.decodeSync(BookingsResponse)(signal.value);

	return (
		<div class="flex flex-col gap-12 p-12">
			<h1 class="text-2xl">My bookings</h1>
			<div class="flex gap-4 flex-wrap justify-center">
				{bookings.map((booking) => (
					<BookingCard key={booking.id} booking={booking} />
				))}
			</div>
		</div>
	);
});

export const head: DocumentHead = {
	title: "Bookings",
};
