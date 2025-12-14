# Flight Booking System - Design Guidelines

## Design Approach

**Reference-Based Strategy**: Drawing inspiration from modern travel platforms (Airbnb, Booking.com, Skyscanner) with emphasis on clarity, trust-building, and seamless multi-step workflows. The design balances emotional appeal of travel discovery with the precision required for transaction completion.

## Typography System

**Font Families**:
- Primary: Inter (via Google Fonts) - all UI elements, forms, data
- Display: Plus Jakarta Sans - hero headlines, section titles

**Hierarchy**:
- Hero Headlines: text-5xl to text-7xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body Text: text-base, font-normal
- Metadata/Labels: text-sm, font-medium
- Microcopy: text-xs, font-normal

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Container max-width: max-w-7xl with px-4 to px-8

**Grid System**: 
- Search filters: 4-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Flight cards: Single column for optimal readability
- Seat map: Grid based on aircraft layout (6-8 columns typical)
- Dashboard: 3-column stat cards (grid-cols-1 md:grid-cols-3)

## Page-Specific Layouts

### Homepage/Landing
**Hero Section** (h-[600px]):
- Large hero image: Aerial view of airplane wing over clouds at sunset or modern airport terminal
- Overlay gradient for text readability
- Centered search form with blurred background (backdrop-blur-xl bg-white/90)
- Search form contains: origin, destination, date pickers, passenger count, class selector, prominent search button
- Below search: Trust indicators (e.g., "10M+ flights booked", "24/7 support")

**Popular Destinations Section**: 
- 4-column grid of destination cards with images
- Each card: destination image, city name, starting price
- Cards use hover lift effect (hover:translate-y-[-4px])

**Why Choose Us Section**:
- 3-column feature grid
- Icons from Heroicons (airplane, shield-check, clock)
- Short benefit statements

### Flight Search Results
**Sticky Filter Sidebar** (w-80):
- Left sidebar with filters: price range slider, stops (non-stop, 1 stop, 2+), airlines checkboxes, departure time slots
- Scrollable results area with full-width flight cards

**Flight Card Design**:
- Horizontal layout: airline logo (left) → flight details (center) → price + CTA (right)
- Flight details: departure/arrival times (text-2xl font-bold), airport codes, duration, stops indicator
- Visual timeline between departure and arrival
- Expandable section for baggage, amenities (click to reveal)
- Price prominently displayed with "Select" button

### Seat Selection
**Interactive Seat Map**:
- Aircraft cross-section visualization
- Grid layout representing seat configuration (3-3 for economy, 2-2 for business)
- Seat states: available, selected, occupied (different styling for each)
- Legend explaining seat colors
- Running total of selected seats with pricing
- Class sections clearly demarcated (Economy, Premium Economy, Business)

### Booking Checkout
**Multi-Step Progress Indicator**:
- Horizontal stepper: Passenger Details → Payment → Confirmation
- Active step highlighted, completed steps with checkmarks

**Passenger Details Form**:
- One form per passenger in accordion/expandable cards
- Fields: Title, First Name, Last Name, DOB, Passport Number
- Form validation with inline error messages

**Payment Section**:
- Tab navigation: Credit Card | Debit Card | UPI | Wallet
- Card payment form with card preview component showing live formatting
- Security badges (SSL, PCI Compliance icons)
- Price breakdown sidebar (sticky): Base fare, Taxes, Seat charges, Total

### User Dashboard
**Navigation Tabs**: Upcoming Trips | Past Bookings | Profile

**Booking Cards** (Upcoming):
- Large card format with flight route as header
- Departure/arrival details with date/time
- PNR number prominently displayed
- Action buttons: View Ticket, Modify, Cancel
- Visual boarding pass-style design element

**Stats Overview** (3-column):
- Total trips, Countries visited, Miles flown
- Icon + large number + label format

### Admin Panel
**Sidebar Navigation**: 
- Flights | Bookings | Analytics | Users
- Icons from Heroicons

**Flight Management Table**:
- Sortable columns: Flight Number, Route, Date, Status, Capacity
- Inline edit/delete actions
- Add Flight button (top-right, prominent)

**Analytics Dashboard**:
- Revenue chart (line graph)
- Booking trends (bar chart)
- 4-column stat cards: Today's Bookings, Revenue, Active Flights, Occupancy Rate

## Component Library

### Navigation Header
- Transparent on homepage hero (with blur), solid white on scroll
- Logo (left), nav links (center): Flights, My Trips, Help
- User menu (right): Profile avatar or Login/Register buttons
- Sticky positioning

### Search Form Component
- Grouped input fields with clear labels
- Date picker with calendar popup
- Passenger/class selector as dropdown with counter controls
- Form uses shadow-lg and rounded-2xl styling

### Cards
- Rounded corners: rounded-xl
- Elevation: shadow-md with hover:shadow-xl transition
- Padding: p-6
- Border: border border-gray-200 (subtle)

### Buttons
Primary CTA: Large (px-8 py-3), rounded-lg, font-semibold
Secondary: Outlined variant
Icon buttons: Square with centered icon, rounded-lg

### Modals/Overlays
- Centered overlay with backdrop-blur-sm
- Modal content: max-w-2xl, rounded-2xl, shadow-2xl
- Close button (top-right)

### Form Inputs
- Height: h-12
- Rounded: rounded-lg
- Border: border-2 (thicker for focus state)
- Labels: text-sm font-medium, mb-2
- Helper text: text-xs below input

## Images

**Hero Section**: Full-width background image of airplane wing above clouds during golden hour OR modern glass airport terminal with natural light - conveys both adventure and professionalism

**Destination Cards**: Cityscape images - iconic landmarks (Eiffel Tower, Taj Mahal, NYC skyline, Tokyo streets) - cropped to 16:9, overlay with gradient for text

**Empty States**: Illustrated scenes (no flights found, no bookings yet) - friendly, simple illustrations

**Profile/Avatar**: User initials in colored circle as fallback

## Animations

**Minimal, Purposeful Motion**:
- Page transitions: Fade in with slight upward movement (animate-fade-in-up)
- Flight card hover: Subtle lift (translate-y-[-4px] transition-transform duration-200)
- Seat selection: Scale pulse on click
- Form submission: Loading spinner on button
- Search results: Stagger fade-in for flight cards (delay-100, delay-200, etc.)

**No animations**: Background parallax, continuous loops, page-load animations beyond initial fade-in

## Responsive Behavior

**Breakpoints**:
- Mobile (base): Stack all columns, full-width components
- Tablet (md: 768px): 2-column grids, show sidebar
- Desktop (lg: 1024px): Full multi-column layouts

**Mobile-Specific**:
- Bottom sticky CTA bar for flight selection
- Hamburger menu for navigation
- Filter sidebar becomes bottom sheet
- Seat map with horizontal scroll and zoom controls

## Accessibility

- Keyboard navigation for all interactive elements
- Focus indicators: ring-2 ring-offset-2
- ARIA labels on icon-only buttons
- Form errors announced to screen readers
- Color contrast ratios meet WCAG AA standards
- Date picker keyboard accessible

This design creates a premium, trustworthy booking experience that balances emotional engagement with transactional efficiency.