import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { queryKeys } from '../../queries/queryKeys';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, subDays } from 'date-fns';
import { AdminLayout } from '../../components/layout/AdminLayout';

interface CalendarLoan {
  id: string;
  loanNumber: string;
  releaseDate: string;
  dueDate: string;
  borrower?: {
    firstName: string;
    lastName: string;
  };
  creditor?: {
    firstName: string;
    lastName: string;
  };
}

interface CalendarEvent {
  date: Date;
  type: 'release' | 'due';
  loan: CalendarLoan;
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: loans = [] } = useQuery({
    queryKey: queryKeys.loans.list(1, 1000, '', 'active'),
    queryFn: async () => {
      const response = await apiClient.get('/api/loans?limit=1000&status=active');
      return response.data.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - calendar data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Generate full calendar grid with padding days
  const startingDayOfWeek = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
  const paddingDays = startingDayOfWeek > 0 
    ? Array.from({ length: startingDayOfWeek }, (_, i) => 
        subDays(monthStart, startingDayOfWeek - i)
      )
    : [];
  const fullCalendarDays = [...paddingDays, ...calendarDays];

  const events = useMemo(() => {
    const eventMap: { [key: string]: CalendarEvent[] } = {};

    loans.forEach((loan: CalendarLoan) => {
      const releaseDate = new Date(loan.releaseDate);
      const dueDate = new Date(loan.dueDate);

      const releaseDateStr = format(releaseDate, 'yyyy-MM-dd');
      const dueDateStr = format(dueDate, 'yyyy-MM-dd');

      if (!eventMap[releaseDateStr]) {
        eventMap[releaseDateStr] = [];
      }
      if (!eventMap[dueDateStr]) {
        eventMap[dueDateStr] = [];
      }

      eventMap[releaseDateStr].push({
        date: releaseDate,
        type: 'release',
        loan,
      });

      eventMap[dueDateStr].push({
        date: dueDate,
        type: 'due',
        loan,
      });
    });

    return eventMap;
  }, [loans]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getDayEvents = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events[dateStr] || [];
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const mobileEvents = useMemo(() => {
    return fullCalendarDays
      .map((day) => ({ day, dayEvents: getDayEvents(day), isCurrentMonth: isSameMonth(day, currentDate) }))
      .filter((item) => item.isCurrentMonth && item.dayEvents.length > 0);
  }, [fullCalendarDays, currentDate, events]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Calendar className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Loan Calendar</h1>
          </div>
          <p className="text-slate-600">
            Track all loan release and due dates at a glance
          </p>
        </div>

        {/* Calendar Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-4 sm:px-6 sm:py-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            <h2 className="text-lg font-bold text-white sm:text-2xl">
              {format(currentDate, 'MMMM yyyy')}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          {/* Mobile Event List */}
          <div className="space-y-3 p-4 md:hidden">
            {mobileEvents.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                No scheduled events this month.
              </p>
            ) : (
              mobileEvents.map(({ day, dayEvents }) => (
                <div key={day.toISOString()} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{format(day, 'EEE, MMM d')}</p>
                  <div className="mt-2 space-y-1.5">
                    {dayEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`rounded-md px-2 py-1.5 text-xs font-medium text-white ${
                          event.type === 'release' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        title={`${event.loan.loanNumber} - ${event.loan.borrower?.firstName || event.loan.creditor?.firstName} ${event.loan.borrower?.lastName || event.loan.creditor?.lastName}`}
                      >
                        {event.type === 'release' ? 'Release' : 'Due'}: {event.loan.loanNumber}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Calendar Grid */}
          <div className="hidden p-6 md:block">
            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-bold text-slate-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {fullCalendarDays.map((day) => {
                const dayEvents = getDayEvents(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday =
                  format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-24 p-2 border rounded-lg transition-colors ${
                      isCurrentMonth
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50 text-slate-400'
                    } ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                  >
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        isToday ? 'text-blue-600' : 'text-slate-900'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.map((event, index) => (
                        <div
                          key={index}
                          className={`text-xs p-1 rounded truncate text-white font-medium cursor-help ${
                            event.type === 'release'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                          title={`${event.loan.loanNumber} - ${event.loan.borrower?.firstName || event.loan.creditor?.firstName} ${event.loan.borrower?.lastName || event.loan.creditor?.lastName}`}
                        >
                          {event.type === 'release' ? '📤' : '📥'}{' '}
                          {event.loan.loanNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-slate-600">Release Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm text-slate-600">Due Date</span>
            </div>
          </div>
        </div>

        {/* Loans Summary */}
        {loans.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Active Loans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loans.map((loan: CalendarLoan) => (
                <div
                  key={loan.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="font-semibold text-slate-900 mb-2">
                    {loan.loanNumber}
                  </div>
                  <div className="text-sm text-slate-600 mb-3">
                    {loan.borrower?.firstName || loan.creditor?.firstName} {loan.borrower?.lastName || loan.creditor?.lastName}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                      <span>Release: {format(new Date(loan.releaseDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                      <span>Due: {format(new Date(loan.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loans.length === 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-600 text-lg">No loans to display</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
