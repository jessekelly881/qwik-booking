/**
 * API Service
 */

import {
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
