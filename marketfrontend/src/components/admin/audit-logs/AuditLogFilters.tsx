import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Download, Filter, RotateCcw, Search } from 'lucide-react';

interface AuditLogFiltersProps {
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  onExport: () => void;
}

type DatePreset = 'TODAY' | '7D' | '30D' | '3M' | 'CUSTOM';

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'Tất cả hành động' },
  { value: 'APPROVE_PRODUCT', label: 'Duyệt sản phẩm' },
  { value: 'REJECT_PRODUCT', label: 'Từ chối sản phẩm' },
  { value: 'APPROVE_SHOP', label: 'Duyệt nhà bán' },
  { value: 'REJECT_SHOP', label: 'Từ chối nhà bán' },
  { value: 'BLOCK_USER', label: 'Khóa người dùng' },
  { value: 'UNBLOCK_USER', label: 'Mở khóa người dùng' },
  { value: 'BLOCK_SHOP', label: 'Khóa nhà bán' },
  { value: 'UNBLOCK_SHOP', label: 'Mở khóa nhà bán' },
  { value: 'RESET_USER_PASSWORD', label: 'Cấp lại mật khẩu người dùng' },
  { value: 'RESET_SELLER_PASSWORD', label: 'Cấp lại mật khẩu nhà bán' },
  { value: 'APPROVE_PAYMENT', label: 'Duyệt thanh toán' },
  { value: 'UPDATE_SETTINGS', label: 'Cập nhật cài đặt' },
];

const RESOURCE_OPTIONS = [
  { value: 'ALL', label: 'Mọi tài nguyên' },
  { value: 'PRODUCT', label: 'Sản phẩm' },
  { value: 'SHOP', label: 'Nhà bán' },
  { value: 'USER', label: 'Người dùng' },
  { value: 'ORDER', label: 'Đơn hàng' },
  { value: 'SYSTEM', label: 'Hệ thống' },
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'TODAY', label: 'Hôm nay' },
  { value: '7D', label: '7 ngày' },
  { value: '30D', label: '30 ngày' },
  { value: '3M', label: '3 tháng' },
  { value: 'CUSTOM', label: 'Tùy chọn' },
];

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeFromPreset(preset: DatePreset) {
  const end = new Date();
  const start = new Date();

  if (preset === 'TODAY') {
    start.setHours(0, 0, 0, 0);
  } else if (preset === '7D') {
    start.setDate(start.getDate() - 7);
  } else if (preset === '30D') {
    start.setDate(start.getDate() - 30);
  } else {
    start.setMonth(start.getMonth() - 3);
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    startInput: toDateInputValue(start),
    endInput: toDateInputValue(end),
  };
}

export default function AuditLogFilters({ onFilterChange, onReset, onExport }: AuditLogFiltersProps) {
  const defaultRange = useMemo(() => rangeFromPreset('30D'), []);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('ALL');
  const [resourceType, setResourceType] = useState('ALL');
  const [datePreset, setDatePreset] = useState<DatePreset>('30D');
  const [startInput, setStartInput] = useState(defaultRange.startInput);
  const [endInput, setEndInput] = useState(defaultRange.endInput);

  const emitFilters = (overrides: Record<string, any> = {}) => {
    onFilterChange({
      search,
      action,
      resourceType,
      startDate: new Date(`${startInput}T00:00:00`).toISOString(),
      endDate: new Date(`${endInput}T23:59:59`).toISOString(),
      ...overrides,
    });
  };

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === 'CUSTOM') return;
    const range = rangeFromPreset(preset);
    setStartInput(range.startInput);
    setEndInput(range.endInput);
    emitFilters({ startDate: range.startDate, endDate: range.endDate });
  };

  const handleReset = () => {
    const range = rangeFromPreset('30D');
    setSearch('');
    setAction('ALL');
    setResourceType('ALL');
    setDatePreset('30D');
    setStartInput(range.startInput);
    setEndInput(range.endInput);
    onReset();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          emitFilters();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-3">
          <div className="relative group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm email, hành động, Resource ID, IP, chi tiết..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-800 transition-all text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>

          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              emitFilters({ action: e.target.value });
            }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-800 text-sm appearance-none cursor-pointer"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value);
              emitFilters({ resourceType: e.target.value });
            }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-800 text-sm appearance-none cursor-pointer"
          >
            {RESOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetChange(preset.value)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${
                  datePreset === preset.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startInput}
                onChange={(e) => {
                  setDatePreset('CUSTOM');
                  setStartInput(e.target.value);
                }}
                className="pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">đến</span>
            <input
              type="date"
              value={endInput}
              onChange={(e) => {
                setDatePreset('CUSTOM');
                setEndInput(e.target.value);
              }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 transition-all text-sm border-0 cursor-pointer flex items-center gap-2"
            >
              <Filter size={17} /> Lọc
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all border-0 cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={19} />
            </button>
            <button
              type="button"
              onClick={onExport}
              className="px-5 py-2.5 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 font-black rounded-xl transition-all text-sm cursor-pointer flex items-center gap-2"
            >
              <Download size={17} /> Export
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
