// components/DatePickerWithPopover.tsx

import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useState } from "react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export function DatePickerWithPopover({
  value,
  onChange,
  disabled = false,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          {value ? format(value, "yyyy/MM/dd", { locale: ja }) : <span className="text-muted-foreground">日付を選択</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          locale={ja}
        />
      </PopoverContent>
    </Popover>
  )
}
