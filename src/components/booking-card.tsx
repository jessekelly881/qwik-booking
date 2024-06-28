import { Link } from "@builder.io/qwik-city";
import { Option } from "effect";
import { BookingsResponse } from "~/api";
import { CancelledBadge, PaidBadge } from "~/components/badges";
import { DataPoint } from "~/components/router-head/data-point";
import { formatTotal, totalAsFloat } from "~/utils";

const Booking = BookingsResponse.rest[0];
type Booking = (typeof BookingsResponse.Type)[0];

export const BookingCard = ({ booking }: { booking: Booking }) => (
	<Link
		href={`/bookings/${booking.id}`}
		key={booking.id}
		class="group flex hover:border-blue-400 transition-colors duration-300 rounded flex-col gap-4 border border-zinc-800 w-96 py-4 px-6"
	>
		<div class="flex justify-between">
			<div>
				<div class="flex flex-row gap-4">
					<h2 class="text-lg">{booking.hotelName}</h2>
				</div>
				<span class="text-sm text-zinc-500">
					{Option.map(booking.checkInDate, (checkIn) =>
						checkIn.toDateString(),
					).pipe(Option.getOrUndefined)}{" "}
					-{" "}
					{Option.map(booking.checkOutDate, (checkOut) =>
						checkOut.toDateString(),
					).pipe(Option.getOrUndefined)}
				</span>
			</div>
			<span class="text-sm text-zinc-500 group-hover:text-blue-400">View</span>
		</div>
		<div style="flex flex-row justify-between">
			<div class="inline-flex flex-row gap-6">
				<DataPoint
					title="Price"
					value={formatTotal(
						totalAsFloat(booking.total, booking.currencyCode),
						booking.currencyCode,
					)}
				/>
				<DataPoint title="Guests" value={booking.occupancy.toString()} />
			</div>
			<br />
			<br />
			<div class="gap-1 inline-flex flex-row h-auto w-full">
				{booking.paid && <PaidBadge />}
				{booking.cancelled && <CancelledBadge />}
			</div>
		</div>
	</Link>
);
