# 🎨 Design Reference Guide - Quick Lookup

## Color Palette

### Primary Colors
```
Electric Blue (Primary):    #0052FF
Electric Blue (Gradient):   #4D7CFF
```
Usage: Buttons, links, highlights, gradients

### Neutrals
```
Background:                 #FAFAFA
Foreground:                 #0F172A
Muted:                      #F1F5F9
Muted Foreground:           #64748B
Border:                     #E2E8F0
Card:                       #FFFFFF
```
Usage: Backgrounds, text, borders, cards

### Accents
```
Success (Emerald):          #10b981
Warning (Orange):           #f97316
Error (Red):                #ef4444
Info (Blue):                #0052FF
```
Usage: Status indicators, alerts

## Typography

### Fonts
```
Display Font:     Calistoga (serif)
Body Font:        Inter (sans-serif)
Monospace Font:   JetBrains Mono
```

### Font Sizes
```
Hero Headline:    5.25rem  (84px)
Section Header:   3.25rem  (52px)
Card Title:       2rem     (32px)
Body:             1rem     (16px)
Small:            0.875rem (14px)
Label:            0.75rem  (12px)
```

### Font Weights
```
Normal:           400
Medium:           500
Semibold:         600
Bold:             700
```

### Line Heights
```
Headline:         1.05 - 1.15
Body:             1.6 - 1.75
Label:            1.4
```

## Spacing Scale

```
xs:    0.5rem   (8px)
sm:    1rem     (16px)
md:    1.5rem   (24px)
lg:    2rem     (32px)
xl:    3rem     (48px)
2xl:   4rem     (64px)
```

### Usage
```
Padding:         p-6 md:p-8 lg:p-12
Margin:          m-4, m-6, m-8
Gap:             gap-4, gap-6, gap-8
```

## Border Radius

```
Small:           8px     (rounded-lg)
Medium:          12px    (rounded-xl)
Large:           16px    (rounded-2xl)
Extra Large:     24px    (rounded-3xl)
```

## Shadows

### Light
```css
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
```

### Medium
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
```

### Heavy
```css
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

## Responsive Breakpoints

```
Mobile:   < 640px   (sm)
Tablet:   640-1024px (md - lg)
Desktop:  1024px+   (lg - xl)
Wide:     1280px+   (xl - 2xl)
```

### Common Patterns
```jsx
// Mobile first
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

// Responsive padding
className="p-6 md:p-8 lg:p-12"

// Responsive text
className="text-4xl md:text-5xl lg:text-6xl"

// Responsive layout
className="flex flex-col md:flex-row gap-4 md:gap-6"
```

## CSS Classes

### Colors
```
bg-blue-50              (Light blue background)
bg-gradient-to-r        (Horizontal gradient)
from-blue-600           (Gradient start)
to-blue-400             (Gradient end)
text-slate-900          (Dark text)
text-slate-600          (Muted text)
border-slate-200        (Subtle border)
```

### Layout
```
flex                    (Flexbox)
gap-4                   (Spacing between flex items)
grid                    (CSS Grid)
grid-cols-2             (2-column grid)
max-w-6xl               (Max width container)
mx-auto                 (Center horizontally)
```

### Text
```
font-display            (Calistoga serif)
font-sans               (Inter sans-serif)
font-mono               (JetBrains Mono)
text-center             (Center text)
text-balance            (Balanced line breaks)
uppercase               (Uppercase text)
tracking-wide           (Wide letter spacing)
```

### Effects
```
rounded-2xl             (Large border radius)
shadow-lg               (Large shadow)
hover:shadow-xl         (Hover shadow)
transition-all          (Smooth transition)
transform               (Enable transform)
hover:-translate-y-2    (Lift on hover)
backdrop-blur-sm        (Blur background)
```

### Animations
```
animate-fade-up         (Entrance from bottom)
animate-pulse-glow      (Pulsing effect)
animate-float           (Floating motion)
animate-rotate-slow     (Slow rotation)
```

## Common Component Patterns

### Hero Section
```jsx
<section className="relative overflow-hidden">
  <div className="absolute inset-0 opacity-5">
    <img src="/images/hero.jpg" />
  </div>
  <div className="relative p-6 md:p-12 lg:p-16">
    <h1 className="text-6xl lg:text-7xl font-display">
      <span className="gradient-text">Title</span>
    </h1>
    <p className="text-lg text-slate-600">Description</p>
  </div>
</section>
```

### Metric Card
```jsx
<Card hover>
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm text-slate-500">Label</p>
      <p className="text-3xl font-display">Value</p>
    </div>
    <Icon className="text-blue-600" />
  </div>
</Card>
```

### Feature Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {features.map((feature) => (
    <Card hover key={feature.id}>
      <Icon className="mb-4" />
      <h3 className="font-semibold mb-2">{feature.title}</h3>
      <p className="text-slate-600">{feature.description}</p>
    </Card>
  ))}
</div>
```

### Dark Section
```jsx
<section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
  <div className="relative max-w-6xl mx-auto">
    <h2 className="text-4xl font-display mb-8">Title</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Content */}
    </div>
  </div>
</section>
```

### CTA Section
```jsx
<section className="px-6 md:px-8 py-12">
  <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8">
    <h2 className="text-3xl font-display mb-4">Headline</h2>
    <p className="text-lg text-slate-700 mb-8">Description</p>
    <Button>Action</Button>
  </div>
</section>
```

## Animation Timing

```
Entrance:       0.6s ease-out
Hover:          0.3s cubic-bezier(0.4, 0, 0.2, 1)
Pulsing:        2s ease-in-out infinite
Floating:       3s ease-in-out infinite
Rotating:       60s linear infinite
```

## Staggered Animation Pattern

```jsx
{items.map((item, idx) => (
  <div 
    key={idx}
    className="animate-fade-up"
    style={{animationDelay: `${idx * 0.1}s`}}
  >
    {/* Content */}
  </div>
))}
```

## Gradient Text

```jsx
<span className="gradient-text">
  Gradient Text Here
</span>
```

CSS:
```css
.gradient-text {
  background: linear-gradient(to right, #0052FF, #4D7CFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## Glassmorphism

```jsx
<div className="glass">
  {/* Content */}
</div>
```

CSS:
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 82, 255, 0.1);
}
```

## Responsive Images

```jsx
<img 
  src="/images/hero.jpg"
  alt="Description"
  className="w-full h-80 object-cover rounded-2xl"
/>
```

## Form Elements

### Input
```jsx
<input
  type="text"
  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
/>
```

### Button
```jsx
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Action
</button>
```

## Card Component

```jsx
<Card hover shadow="glass">
  <div className="p-6">
    {/* Content */}
  </div>
</Card>
```

## Navigation Link

```jsx
<Link to="/path" className="hover:text-blue-600 transition-colors">
  Link Text
</Link>
```

## Media Queries (Tailwind)

```jsx
// Mobile first approach
<div className="
  p-4 md:p-6 lg:p-8        // Padding
  text-base md:text-lg     // Font size
  grid-cols-1 md:grid-cols-2 lg:grid-cols-4  // Grid
">
```

## Accessibility Checklist

✅ Use semantic HTML
✅ Proper heading hierarchy (h1 → h2 → h3)
✅ Alt text on all images
✅ Color contrast 4.5:1 minimum
✅ Focus indicators visible
✅ Keyboard navigation supported
✅ ARIA labels where needed
✅ Touch targets 44px minimum

## Performance Tips

✅ Use GPU-accelerated animations (transform, opacity)
✅ Avoid animating width, height, left, right
✅ Use CSS classes instead of inline styles
✅ Lazy load images below fold
✅ Minimize re-renders in React
✅ Use CSS Grid/Flexbox instead of float
✅ Debounce scroll/resize events

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Safari
✅ Chrome Mobile

---

## Quick Copy-Paste Templates

### Hero with Image
```jsx
<section className="relative overflow-hidden">
  <div className="absolute inset-0 opacity-5">
    <img src="/images/hero.jpg" />
  </div>
  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl -z-10"></div>
  <div className="relative p-6 md:p-12 lg:p-16">
    <div className="max-w-5xl mx-auto">
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-xs font-mono text-blue-600">
        LABEL
      </span>
      <h1 className="text-6xl lg:text-7xl font-display mt-4">
        <span className="gradient-text">Gradient</span> Text
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mt-6">Description</p>
    </div>
  </div>
</section>
```

### 4-Column Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map((item, idx) => (
    <Card key={idx} className="animate-fade-up" style={{animationDelay: `${idx * 0.1}s`}}>
      {/* Content */}
    </Card>
  ))}
</div>
```

### Dark Section
```jsx
<section className="px-6 md:px-8 py-12 md:py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
  <div className="relative max-w-6xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-display mb-12">Title</h2>
    {/* Content */}
  </div>
</section>
```

---

**Last Updated**: 2024
**Design System**: Minimalist Modern
**Version**: 1.0
