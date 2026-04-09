import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Tamanho fixo do círculo — independente de aspectRatio
const SCREEN_WIDTH   = Dimensions.get('window').width;
const CALENDAR_PAD   = 20 * 2 + 8 * 2; // paddingHorizontal da tela + padding do card
const CELL_SIZE      = Math.floor((SCREEN_WIDTH - CALENDAR_PAD) / 7);
const CIRCLE_SIZE    = Math.min(CELL_SIZE - 4, 36);

interface CalendarProps {
  initialYear?: number;
  initialMonth?: number;
  selectedDay?: number;
  onSelectDay?: (day: number, month: number, year: number) => void;
  onMonthChange?: (month: number, year: number) => void;
  confirmedDays?: number[];
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

  const firstDay     = new Date(year, month, 1).getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const daysInPrev   = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    setMonth(m); setYear(y);
    onMonthChange?.(m, y);
  };

  const nextMonth = () => {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    setMonth(m); setYear(y);
    onMonthChange?.(m, y);
  };

  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: daysInPrev - firstDay + 1 + i, current: false });
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ day: i, current: true });
  const rem = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 1; i <= rem; i++)
    cells.push({ day: i, current: false });

  return (
    <View>
      {/* Navegação mês */}
      <View style={st.header}>
        <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={st.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={st.monthYear}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={st.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Labels dias da semana */}
      <View style={st.daysRow}>
        {DAYS.map(d => (
          <View key={d} style={st.dayLabelCell}>
            <Text style={st.dayLabel}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid de dias */}
      <View style={st.grid}>
        {cells.map((cell, idx) => {
          const isSelected  = cell.current && cell.day === selectedDay;
          const isConfirmed = cell.current && confirmedDays.includes(cell.day);
          const isPending   = cell.current && pendingDays.includes(cell.day);

          const circleBg =
            isSelected  ? '#67C5C0' :
            isConfirmed ? '#222'    :
            isPending   ? '#aaa'    :
            'transparent';

          const textColor =
            isSelected || isConfirmed || isPending ? '#fff' :
            !cell.current ? '#d0d0d0' :
            '#333';

          const fontWeight: '400' | '600' | 'bold' =
            isSelected ? 'bold' :
            (isConfirmed || isPending) ? '600' :
            '400';

          return (
            <TouchableOpacity
              key={idx}
              style={st.cellWrapper}
              onPress={() => cell.current && onSelectDay?.(cell.day, month, year)}
              activeOpacity={0.7}
              disabled={!cell.current}
            >
              {/* Círculo separado do wrapper — garante alinhamento correto */}
              <View style={[st.circle, { backgroundColor: circleBg }]}>
                <Text style={{ fontSize: 13, color: textColor, fontWeight, lineHeight: CIRCLE_SIZE }}>
                  {cell.day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legenda */}
      <View style={st.legend}>
        {[
          { color: '#222',    label: 'Confirmado' },
          { color: '#aaa',    label: 'Pendente'   },
          { color: '#67C5C0', label: 'Selecionado'},
        ].map(item => (
          <View key={item.label} style={st.legendItem}>
            <View style={[st.legendDot, { backgroundColor: item.color }]} />
            <Text style={st.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  arrow: {
    fontSize: 26, paddingHorizontal: 12, color: '#444', lineHeight: 30,
  },
  monthYear: {
    fontSize: 16, fontWeight: '600', color: '#222',
  },
  daysRow: {
    flexDirection: 'row', marginBottom: 4,
  },
  dayLabelCell: {
    width: CELL_SIZE, alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11, color: '#999', fontWeight: '500',
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
  },
  // Wrapper ocupa a célula toda; o círculo fica centralizado dentro
  cellWrapper: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  legendDot: {
    width: 10, height: 10, borderRadius: 5,
  },
  legendText: {
    fontSize: 11, color: '#666',
  },
});
