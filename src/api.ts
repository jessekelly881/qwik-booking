import {
    HttpClient,
    HttpClientRequest,
    HttpClientResponse
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { Config, Effect } from "effect";

// I'm not 100% sure which of these are actually optional/nullable w/o seeing an api spec.

const OptionalDate = Schema.optional(Schema.Date, { nullable: true, as: "Option" });

/**
 * The response from /bookings
 */
export class BookingsResponse extends Schema.Class<BookingsResponse>("BookingsResponse")({
    id: Schema.Int,

    checkInDate: OptionalDate,
    checkOutDate: OptionalDate,

    cancelled: Schema.Boolean,
    currencyCode: Schema.Literal("USD"), // or others? 
    hotelName: Schema.String,
    occupancy: Schema.Int,
    paid: Schema.Boolean,
    total: Schema.Number,
}) {}

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
export class BookingResponse extends Schema.Class<BookingResponse>("BookingResponse")({
    id: Schema.Int,

    cancelledAt: OptionalDate,
    checkInDate: OptionalDate,
    createdAt: OptionalDate,
    checkOutDate: OptionalDate,
    updatedAt: OptionalDate,
    paidInFullAt: OptionalDate,

    currencyCode: Schema.String,
    customer: Customer,
    hotel: Hotel,
    occupancy: Schema.Number,
    notes: Schema.optional(Schema.String, { nullable: true, as: "Option" }),
    room: Room,
    total: Schema.Number,
}) {}

const getBooking = (id: number) => Effect.flatMap(Config.string("X_API_KEY"), apiKey => HttpClientRequest.get(
  `https://traverse-assignment-api.esdee.workers.dev/bookings/${id}`
).pipe(
  HttpClientRequest.setHeaders({
    "Content-type": "application/json; charset=UTF-8",
    "x-api-key": apiKey// todo! - Config.redacted
  }),
  HttpClient.fetch,
  Effect.andThen(HttpClientResponse.schemaBodyJson(BookingResponse)),
  Effect.scoped
))

const apiResponse = await Effect.runPromise(getBooking(1507))
console.log(apiResponse);
