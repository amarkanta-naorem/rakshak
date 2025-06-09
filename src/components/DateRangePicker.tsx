import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays, startOfMonth, endOfMonth, subMonths, format, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

interface PresetRange {
  label: string;
  range: [Date, Date];
}

interface DateRangePickerProps {
  setDateRange: React.Dispatch<React.SetStateAction<[Date | null, Date | null]>>;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ setDateRange }) => {
  const [dateRange, setLocalDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [isOpen, setIsOpen] = useState(false);

  const presetRanges: PresetRange[] = [
    { label: 'Today', range: [new Date(), new Date()] },
    { label: 'Yesterday', range: [subDays(new Date(), 1), subDays(new Date(), 1)] },
    { label: 'Last 7 Days', range: [subDays(new Date(), 6), new Date()] },
    { label: 'Last 30 Days', range: [subDays(new Date(), 29), new Date()] },
    { label: 'This Month', range: [startOfMonth(new Date()), endOfMonth(new Date())] },
    { label: 'Last Month', range: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
    { label: 'This Week', range: [startOfWeek(new Date()), endOfWeek(new Date())] },
  ];

  const handlePresetClick = useCallback((range: [Date, Date]) => {
    setLocalDateRange(range);
    setDateRange(range); // Update parent state
    setIsOpen(false);
  }, [setDateRange]);

  const toggleDatePicker = () => setIsOpen(!isOpen);
  const closeDatePicker = () => setIsOpen(false);

  const resetDateRange = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalDateRange([null, null]);
    setDateRange([null, null]); // Reset parent state
  }, [setDateRange]);

  const formatDateRange = useCallback(() => {
    if (!startDate && !endDate) return 'Select a date range';
    if (!endDate) return `${format(startDate!, 'MMM d, yyyy')} –`;
    return `${format(startDate!, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`;
  }, [startDate, endDate]);

  return (
    <div className="relative w-full max-w-md font-sans text-gray-900">
      <div onClick={toggleDatePicker} className="flex items-center justify-between px-4 py-1 bg-white border border-gray-200 rounded-md cursor-pointer transition-all duration-300 hover:shadow focus-within:ring-2 focus-within:ring-indigo-500">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className="text-indigo-600">
            <g fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172S22 8.229 22 12v2c0 3.771 0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14z" />
              <path strokeLinecap="round" d="M7 4V2.5M17 4V2.5M2.5 9h19" />
              <path fill="currentColor" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0"/>
            </g>
          </svg>
          <span className={`text-sm font-medium transition-colors duration-200 ${ dateRange[0] ? 'text-gray-900' : 'text-gray-400' }`}>{formatDateRange()}</span>
        </div>
        <div className="flex items-center gap-3">
          {(startDate || endDate) && (
            <button onClick={resetDateRange} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200" aria-label="Clear date range">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
          <div className={`w-5 h-5 transform transition-transform duration-300 ${ isOpen ? 'rotate-180' : '' }`}>
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}/>
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-[45.8rem] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-60 p-6 bg-gradient-to-b from-gray-50 to-gray-100 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="space-y-2">
                {presetRanges.map((preset, index) => (
                  <button key={index} onClick={() => handlePresetClick(preset.range)} className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${ startDate && endDate && isSameDay(startDate, preset.range[0]) && isSameDay(endDate, preset.range[1]) ? 'bg-indigo-600 text-white font-semibold shadow-md' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700' }`}>{preset.label}</button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(range) => {
                  setLocalDateRange(range);
                  setDateRange(range); // Update parent state
                }}
                monthsShown={2}
                maxDate={new Date()}
                inline
                shouldCloseOnSelect={false}
                calendarClassName="w-full flex flex-col lg:flex-row space-x-2"
                dayClassName={(date) =>
                  date < startOfMonth(new Date())
                    ? 'text-gray-400 bg-gray-50'
                    : 'text-gray-800 hover:bg-indigo-100 hover:text-indigo-700'
                }
                renderCustomHeader={({ monthDate, decreaseMonth, increaseMonth }) => (
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button onClick={decreaseMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200" aria-label="Previous month">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                        </svg>
                      </button>
                      <span className="text-base font-semibold text-gray-800">{format(monthDate, 'MMMM yyyy')}</span>
                      <button onClick={increaseMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200" aria-label="Next month">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              />

              <div className="flex items-center justify-end border-t border-gray-100 p-4 gap-3">
                <button onClick={resetDateRange} className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200" aria-label="Reset date range">Reset</button>
                <button onClick={closeDatePicker} className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">Cancel</button>
                <button onClick={closeDatePicker} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;