

## Fix: Duplicate Close (X) Buttons on Dialog Modals

### Problem
The `LeadGate` component manually renders its own X close button inside the `DialogTitle` (line 424-432). However, the shared `DialogContent` component already renders an X button automatically (via Radix `DialogPrimitive.Close` at line 45-48 of `dialog.tsx`). This results in two X buttons appearing in the top-right corner.

### Fix
**File: `src/components/shared/LeadGate.tsx`**

Remove the manual X button from the modal's `DialogTitle`. The title should just render the text, and the built-in `DialogContent` close button handles dismissal.

Specifically, change the `DialogTitle` from:
```tsx
<DialogTitle className="flex items-center justify-between">
  {title}
  <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
    <X className="h-4 w-4" />
  </Button>
</DialogTitle>
```
To:
```tsx
<DialogTitle>{title}</DialogTitle>
```

Also remove the `X` icon from the `lucide-react` import if no longer used (it's still used — checking... no, `X` is only used for the close button, so it can be removed from the import).

This is a single-file, ~10-line deletion.

