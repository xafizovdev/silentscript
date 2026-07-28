# Changelog

## 2.0.0

- Fixed server/client price hydration mismatch by replacing locale-dependent `Intl.NumberFormat` output with deterministic formatting.
- Added hydration protection for browser extensions that inject attributes into the document body.
- Added complete Uzbek, English and Russian localization.
- Added persistent language selection and translated search/cart/customizer/order content.
- Reworked cart storage into structured, language-independent items.
- Fixed the initial cart effect that could overwrite saved cart data before loading it.
- Changed checkout destination to `@thatswriter` with a prefilled direct Telegram draft.
- Added customer name, phone, address and comment fields.
- Added responsive language controls, keyboard Escape handling and improved focus states.
- Added multilingual 404 content.
