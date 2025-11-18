import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { DayButton } from "react-day-picker";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function StarredDayButton({
  day,
  modifiers,
  starredDates,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  starredDates: Set<string>;
}) {
  const dateString = day.date.toISOString().split("T")[0];
  const isStarred = starredDates.has(dateString);

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md"
      )}
      {...props}
    >
      <span className="text-sm">{day.date.getDate()}</span>
      {isStarred && (
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 absolute top-0.5 right-0.5" />
      )}
    </Button>
  );
}

export function PerfectCompletionCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const perfectDays = useQuery(api.stats.getPerfectCompletionDays);

  // Convert array of date strings to Set for O(1) lookup
  const starredDatesSet = React.useMemo(() => {
    return new Set(perfectDays || []);
  }, [perfectDays]);

  if (!perfectDays) {
    return <Skeleton className="h-[400px]" />;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Perfect Completion Days</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Days with a star indicate all tasks created were completed on the same
        day
      </p>
      <div className="flex justify-center py-8">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          numberOfMonths={1}
          components={{
            DayButton: (props) => (
              <StarredDayButton {...props} starredDates={starredDatesSet} />
            ),
          }}
          className="rounded-md border scale-125 origin-center"
          style={{ "--cell-size": "3.5rem" } as React.CSSProperties}
        />
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground justify-center">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{perfectDays.length} perfect completion days</span>
      </div>
    </Card>
  );
}
