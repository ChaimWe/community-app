# Architecture

The application uses a simple layered backend:

`route -> controller -> service -> model`

- Routes: URL and authentication only.
- Controllers: translate HTTP requests/responses.
- Services: business rules.
- Models: MongoDB/Mongoose persistence.
- Schemas: request validation contracts.
- Shared package: types/enums used by both sides.

The frontend is organized by feature rather than by giant component files.

The seating generator is intentionally simple in V1: it scores social connections while respecting table capacity. It is designed so a more sophisticated optimizer can replace the service later without changing the UI/API shape.
