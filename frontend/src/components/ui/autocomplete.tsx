import { type KeyboardEvent, useCallback, useRef, useState } from 'react';
import { CommandGroup, CommandItem, CommandList } from 'cmdk';
import { Command as CommandPrimitive } from 'cmdk';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Skeleton } from './skeleton';

export type Option = Record<'value' | 'label', string> & Record<string, string>;

type AutoCompleteProps = {
  options: Option[];
  value?: Option;
  onValueChange?: (value: Option) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export const AutoComplete = ({ options, placeholder, value, onValueChange, disabled, isLoading = false }: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option>(value as Option);
  const [inputValue, setInputValue] = useState<string>(value?.label || '');

  const filteredOptions = options.filter((option) => option.label?.toLowerCase().includes(inputValue?.toLowerCase() || ''));

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === 'Enter' && input.value !== '') {
        const optionToSelect = filteredOptions.find((option) => option.label === input.value);
        if (optionToSelect) {
          setSelected(optionToSelect);
          onValueChange?.(optionToSelect);
        } else {
          // Create a custom option if no exact match found
          const customOption: Option = {
            value: input.value.trim(),
            label: input.value.trim(),
          };
          setSelected(customOption);
          onValueChange?.(customOption);
        }
        // Close the dropdown and blur the input
        setOpen(false);
        input.blur();
      }

      if (event.key === 'Escape') {
        input.blur();
      }
    },
    [isOpen, filteredOptions, onValueChange]
  );

  const handleBlur = useCallback(() => {
    setOpen(false);

    // If there's a value typed but no option selected, create a custom option
    if (inputValue && inputValue.trim() !== '' && !selected) {
      const customOption: Option = {
        value: inputValue.trim(),
        label: inputValue.trim(),
      };
      setSelected(customOption);
      onValueChange?.(customOption);
    }
    // If no value typed, reset everything
    else if (!inputValue || inputValue.trim() === '') {
      setSelected(undefined as any);
      setInputValue('');
    }
    // If there's a selected option but input doesn't match, keep the input value
    // (This handles the case where user typed something different from selected)
  }, [inputValue, selected, onValueChange]);

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(selectedOption.label);

      setSelected(selectedOption);
      onValueChange?.(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [onValueChange]
  );

  return (
    <CommandPrimitive shouldFilter={false}>
      <div onKeyDown={handleKeyDown}>
        <Input
          ref={inputRef}
          value={inputValue || ''}
          onChange={isLoading ? undefined : (e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      <div className="relative mt-1">
        <div
          className={cn(
            'animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl hologram-panel backdrop-blur-md shadow-lg shadow-primary/20 outline-none',
            isOpen ? 'block' : 'hidden'
          )}
        >
          <CommandList className="rounded-lg border border-primary/30 bg-popover/95">
            {isLoading ? (
              <div className="p-1">
                <Skeleton className="h-8 w-full bg-primary/10 border border-primary/20" />
              </div>
            ) : null}
            {filteredOptions.length > 0 && !isLoading ? (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = selected?.value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(option)}
                      className={cn(
                        'flex w-full items-center gap-2 transition-all duration-200',
                        'hover:bg-primary/10 hover:border-l-2 hover:border-l-primary hover:text-primary',
                        'data-[selected=true]:bg-primary/20 data-[selected=true]:border-l-2 data-[selected=true]:border-l-primary data-[selected=true]:text-primary',
                        !isSelected ? 'pl-8' : 'pl-6'
                      )}
                    >
                      {isSelected ? <Check className="w-4 h-4 text-primary" /> : null}
                      <span className={cn(isSelected && 'neon-text')}>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  );
};
