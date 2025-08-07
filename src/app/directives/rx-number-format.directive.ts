import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[rxNumberFormat]',
  standalone: false,
})
export class RxNumberFormatDirective {
  // Default max digits before decimal point
  @Input() maxBeforeDecimal = 8;
  // Default max digits after decimal point
  @Input() maxAfterDecimal = 4;
  // Allow negative numbers (default: true)
  @Input() allowNegative = true;

  // Special keys that should be allowed
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Control', 'a', 'c', 'v', 'x', 'ArrowLeft', 'ArrowRight', 'Delete'];

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow special keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    // Special handling for negative sign
    if (event.key === '-') {
      // Only allow negative sign if it's enabled
      if (!this.allowNegative) {
        event.preventDefault();
        return;
      }

      const input = event.target as HTMLInputElement;
      const current: string = input.value;
      const position = input.selectionStart || 0;

      // Only allow negative sign at the beginning of the input
      if (position !== 0 || current.includes('-')) {
        event.preventDefault();
        return;
      }

      return;
    }

    const input = event.target as HTMLInputElement;
    const current: string = input.value;
    const position = input.selectionStart || 0;

    // Special handling for decimal point or comma
    if (event.key === '.' || event.key === ',') {
      // If decimal already exists (either . or ,), prevent adding another one
      if (current.includes('.') || current.includes(',')) {
        event.preventDefault();
        return;
      }
      // Always allow adding decimal separator
      return;
    }

    // For regular digits
    if (/^\d$/.test(event.key)) {
      const decimalIndex = current.search(/[\.,]/);

      // Check if cursor is positioned after decimal point
      if (decimalIndex !== -1 && position > decimalIndex) {
        // Count digits after decimal
        const afterDecimal = current.substring(decimalIndex + 1).length;
        const isReplacing = position < current.length && /\d/.test(current[position]);

        // Only prevent if we exceed max digits after decimal
        if (afterDecimal >= this.maxAfterDecimal && !isReplacing) {
          event.preventDefault();
        }
      }
      // If cursor is before decimal or no decimal exists
      else {
        // Count digits before decimal (without negative sign)
        const beforeDecimal = current.replace(/[^0-9]/g, '').length;
        const isReplacing = position < current.length && /\d/.test(current[position]);

        // Only prevent if we exceed max digits before decimal
        if (beforeDecimal >= this.maxBeforeDecimal && !isReplacing) {
          event.preventDefault();
        }
      }

      // Allow digit in all other cases
      return;
    }

    // Block any other key not handled above
    event.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    const pastedTextRaw = clipboardData ? clipboardData.getData('text') : '';
    const pastedText = pastedTextRaw.replace(',', '.');

    // Check if negative is allowed
    const negativePattern = this.allowNegative ? '-?' : '';
    // Allow both . and , as decimal separator
    const validPattern = new RegExp(`^${negativePattern}\\d*([\\.,]?\\d*)?$`);

    // Only allow pasting numbers and decimal point/comma (and negative if allowed)
    if (!validPattern.test(pastedTextRaw)) {
      return;
    }

    // Don't allow pasting negative number if negative not allowed
    if (!this.allowNegative && pastedText.includes('-')) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const current: string = input.value;
    const position = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || position;

    // Check if selection is available (not for number inputs)
    const inputType = input.type.toLowerCase();
    const supportsSelection = inputType !== 'number';

    // Default position to end of input if selection isn't supported
    const startPos = supportsSelection && position !== null ? position : current.length;
    const endPos = supportsSelection && selectionEnd !== null ? selectionEnd : current.length;

    // Remove the selected text first
    let result = current.substring(0, startPos) + current.substring(endPos);

    // Insert the pasted text (normalized)
    result = result.substring(0, startPos) + pastedText + result.substring(startPos);

    // Apply our constraints
    const finalValue = this.applyConstraints(result);

    // Update the input value
    input.value = finalValue;

    // Set cursor position after pasted text (only for supported input types)
    if (supportsSelection) {
      try {
        const newCursorPos = Math.min(startPos + pastedText.length, finalValue.length);
        input.selectionStart = input.selectionEnd = newCursorPos;
      } catch (error) {
        // Ignore selection errors
      }
    }

    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Skip validation if input is empty
    if (!value) {
      return;
    }

    // Store cursor position, but check for input type
    const inputType = input.type.toLowerCase();
    const supportsSelection = inputType !== 'number';
    let start: number | null = null;
    let end: number | null = null;

    // Only use selection if the input type supports it
    if (supportsSelection) {
      start = input.selectionStart ?? null;
      end = input.selectionEnd ?? null;
    }

    // Apply our constraints
    const finalValue = this.applyConstraints(value);

    // Only update if value has changed
    if (finalValue !== value) {
      input.value = finalValue;

      // Try to maintain cursor position only for supported input types
      if (supportsSelection && start !== null && end !== null) {
        try {
          input.setSelectionRange(Math.min(start, finalValue.length), Math.min(end, finalValue.length));
        } catch (error) {
          // Ignore selection errors
        }
      }

      // Dispatch input event to notify Angular of the change
      const inputEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(inputEvent);
    }
  }

  // Helper method to apply constraints to any value
  private applyConstraints(value: string): string {
    // Normalize comma to dot for decimal separator
    value = value.replace(',', '.');
    // If negative numbers are not allowed, remove any minus sign
    if (!this.allowNegative) {
      value = value.replace(/-/g, '');
    }

    // Split at decimal point
    const parts = value.split('.');

    // Handle digits before decimal
    if (parts[0]) {
      const negativeSign = this.allowNegative && parts[0].startsWith('-') ? '-' : '';
      const digitsOnly = parts[0].replace(/[^0-9]/g, '');

      if (digitsOnly.length > this.maxBeforeDecimal) {
        parts[0] = negativeSign + digitsOnly.substring(0, this.maxBeforeDecimal);
      } else {
        parts[0] = negativeSign + digitsOnly;
      }
    }

    // Handle digits after decimal
    if (parts.length > 1) {
      if (parts[1].length > this.maxAfterDecimal) {
        parts[1] = parts[1].substring(0, this.maxAfterDecimal);
      }
    }

    // Reconstruct value
    return parts.length > 1 ? parts.join('.') : parts[0];
  }
}
