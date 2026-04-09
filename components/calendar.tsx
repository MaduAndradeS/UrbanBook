import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface CalendarProps {
  initialYear?: number;
  initialMonth?: number;       // 0-indexed
  selectedDay?: number;
  onSelectDay?: (day: number, month: number, year: number) => void;
  onMonthChange?: (month: number, year: number) => void;
  /** Dias com pelo menos 1 agendamento CONFIRMADO → fundo preto */
  confirmedDays?: number[];
  /** Dias com agendamento PENDENTE (e nenhum confirmado) → fundo cinza */
  pendingDays?: number[];
}

export default function Calendar({
  initialYear,
  initialMonth,
  selectedDay,
  onSelectDay,
  onMonthChange,
  confirmedDays = [],
  pendingDays = [],
}: CalendarProps) {
  const today = new Date();
  const [year, setYear]   = useState(initialYear ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? today.getMonth());

  const firstDayOfMonth  = new Date(year, month, 1).getDay();
  const daysInMonth      = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth  = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear  = month === 0 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    onMonthChange?.(newMonth, newYear);
  };

  const nextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear  = month === 11 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    onMonthChange?.(newMonth, newYear);
  };

  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push({ day: daysInPrevMonth - firstDayOfMonth + 1 + i, current: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, current: true });
  }
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, current: false });
  }

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={prevMonth}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthYear}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity
          onPress={nextMonth}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        {DAYS.map(d => (
          <Text key={d} style={styles.dayLabel}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, idx) => {
          const isSelected  = cell.current && cell.day === selectedDay;
          const isConfirmed = cell.current && confirmedDays.includes(cell.day);
          const isPending   = cell.current && pendingDays.includes(cell.day);

          const bgStyle =
            isSelected  ? styles.bgSelected  :
            isConfirmed ? styles.bgConfirmed :
            isPending   ? styles.bgPending   :
            null;

          const textStyle =
            isSelected               ? styles.textSelected   :
            isConfirmed              ? styles.textOnDark     :
            isPending                ? styles.textOnDark     :
            !cell.current            ? styles.textOtherMonth :
            styles.textDefault;

          return (
            <TouchableOpacity
              key={idx}
              style={[styles.cell, bgStyle]}
              onPress={() => cell.current && onSelectDay?.(cell.day, month, year)}
              activeOpacity={0.7}
              disabled={!cell.current}
            >
              <Text style={textStyle}>{cell.day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#222' }]} />
          <Text style={styles.legendText}>Confirmado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#aaa' }]} />
          <Text style={styles.legendText}>Pendente</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#67C5C0' }]} />
          <Text style={styles.legendText}>Selecionado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  arrow: {
    fontSize: 26,
    paddingHorizontal: 12,
    color: '#444',
    lineHeight: 30,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  bgSelected:  { backgroundColor: '#67C5C0' },
  bgConfirmed: { backgroundColor: '#222' },
  bgPending:   { backgroundColor: '#aaa' },

  textDefault:    { fontSize: 13, color: '#333' },
  textSelected:   { fontSize: 13, color: '#fff', fontWeight: 'bold' },
  textOnDark:     { fontSize: 13, color: '#fff', fontWeight: '600' },
  textOtherMonth: { fontSize: 13, color: '#d0d0d0' },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
});
