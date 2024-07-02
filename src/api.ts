/**
 * API Service
 */

/**
 * We need Admins to be able to cancel bookings and add notes about the reason for this cancellation.



Add a button to the /bookings/<id> page that reads ‘Cancel This Booking’.



This button should only show on bookings that are NOT cancelled



When clicked this button should:

become hidden

reveal a text input and 2 buttons, ‘Confirm Cancellation’ and ‘Do Not Cancel’.



If the ‘Do Not Cancel’ button is clicked the page state should revert back to its previous state.



If the ‘Confirm Cancellation’ is clicked the page should PUT to /bookings/<id>/cancellations

The body of this put should be the value in the text input as JSON {“notes”: <text>}



The api can respond with status codes:

200 (success)

400 (e.g. already cancelled)

401 (unauthorized)

404 (id not found)

500



On success the page should display the booking - buttons and text area should be hidden.


It is important that the PUT request is made on the server, and not the client.

We do NOT want the x-api-key header to be revealed.



Pairing Expectations

———————————-

We do not need to arrive at a full solution. The point is to discuss how we approach a feature request like this.

You will be leading this pairing session but it is perfectly acceptable to ask about the Qwik APIs etc.

The aim of this exercise is to gauge communication and to b e able to discuss how you approach day to day coding.


 */

import {
	HttpBody,
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { Config, Effect } from "effect";

// I'm not 100% sure which of these are actually optional/nullable w/o seeing an api spec.

const OptionalDate = Schema.optional(Schema.Date, {
	nullable: true,
	as: "Option",
});

export const CurrencyCode = Schema.Literal("USD"); // or others?
export type CurrencyCode = typeof CurrencyCode.Type;

/**
 * The response from /bookings
 */
export const BookingsResponse = Schema.Struct({
	id: Schema.Int,

	checkInDate: OptionalDate,
	checkOutDate: OptionalDate,

	cancelled: Schema.Boolean,
	currencyCode: CurrencyCode,
	hotelName: Schema.String,
	occupancy: Schema.Int,
	paid: Schema.Boolean,
	total: Schema.Number,
}).pipe(Schema.Array);

class Room extends Schema.Class<Room>("Room")({
	id: Schema.Number,
	maxUnits: Schema.Number,
	maxOccupancy: Schema.Number,
	name: Schema.String,
}) {}

class Hotel extends Schema.Class<Hotel>("Hotel")({
	id: Schema.Number,
	name: Schema.String,
}) {}

class Customer extends Schema.Class<Customer>("Customer")({
	bookingIds: Schema.Array(Schema.Int),
	email: Schema.String,
	firstName: Schema.String,
	id: Schema.Number,
	lastName: Schema.String,
}) {}

/**
 * Response from /booking/:id
 */
export const BookingResponse = Schema.Struct({
	id: Schema.Int,

	cancelledAt: OptionalDate,
	checkInDate: OptionalDate,
	createdAt: OptionalDate,
	checkOutDate: OptionalDate,
	updatedAt: OptionalDate,
	paidInFullAt: OptionalDate,

	currencyCode: CurrencyCode,
	customer: Customer,
	hotel: Hotel,
	occupancy: Schema.Number,
	notes: Schema.optional(Schema.String, { nullable: true, as: "Option" }),
	room: Room,
	total: Schema.Number,
});

export const getBooking = (id: number) =>
	Effect.flatMap(Config.string("X_API_KEY"), (apiKey) =>
		HttpClientRequest.get(
			`https://traverse-assignment-api.esdee.workers.dev/bookings/${id}`,
		).pipe(
			HttpClientRequest.setHeaders({
				"Content-type": "application/json; charset=UTF-8",
				"x-api-key": apiKey,
			}),
			HttpClient.fetch.pipe(HttpClient.filterStatusOk),
			Effect.andThen(
				HttpClientResponse.schemaBodyJson(
					Schema.encodedSchema(BookingResponse),
				),
			),
			Effect.scoped,
		),
	);

export const getBookings = Effect.flatMap(
	Config.string("X_API_KEY"),
	(apiKey) =>
		HttpClientRequest.get(
			"https://traverse-assignment-api.esdee.workers.dev/bookings",
		).pipe(
			HttpClientRequest.setHeaders({
				"Content-type": "application/json; charset=UTF-8",
				"x-api-key": apiKey,
			}),
			HttpClient.fetch.pipe(HttpClient.filterStatusOk),
			// must use encoded schema in order for qwik to serialize it properly. It's then decoded fully on the client.
			Effect.andThen(
				HttpClientResponse.schemaBodyJson(
					Schema.encodedSchema(BookingsResponse),
				),
			),
			Effect.scoped,
		),
);

export const cancelBooking = (id: number, notes: string) =>
	Effect.gen(function* () {
		const apiKey = yield* Config.string("X_API_KEY");
		const body = yield* HttpBody.json({ notes });
		yield* HttpClientRequest.put(
			`https://traverse-assignment-api.esdee.workers.dev/bookings/${id}/cancellations`,
		).pipe(
			HttpClientRequest.setBody(body),
			HttpClientRequest.setHeaders({
				"Content-type": "application/json; charset=UTF-8",
				"x-api-key": apiKey,
			}),
			HttpClient.fetchOk,
		);
	}).pipe(Effect.scoped);
