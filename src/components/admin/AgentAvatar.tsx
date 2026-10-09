/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { AIAgent, AgentState } from "../../data/agents";

interface AgentAvatarProps {
  agent: AIAgent;
  state?: AgentState;
  size?: "small" | "medium" | "large";
  onClick?: (agent: AIAgent) => void;
}

const STATE_CONFIG = {
  idle: { color: "#9ca3af", label: "Chờ thực hiện", icon: "⏸️", pulse: false },
  running: { color: "#3b82f6", label: "Đang xử lý", icon: "⚙️", pulse: true },
  success: { color: "#10b981", label: "Hoàn thành", icon: "✅", pulse: false },
  waiting: { color: "#f59e0b", label: "Chờ duyệt", icon: "⏳", pulse: true },
  error: { color: "#ef4444", label: "Lỗi xử lý", icon: "❌", pulse: false },
};

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agent,
  state = "idle",
  size = "medium",
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const stateData = STATE_CONFIG[state];

  // Kích thước CSS theo chuẩn yêu cầu
  const sizeClasses = {
    small: "w-12 h-12 md:w-16 md:h-16", // 48-64px
    medium: "w-20 h-20 md:w-24 md:h-24", // 64-96px
    large: "w-36 h-36 md:w-44 md:h-44",
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className="relative flex flex-col items-center group cursor-pointer"
      onClick={() => onClick && onClick(agent)}
      title={`${agent.name} (${agent.title}) - ${agent.description}`}
    >
      {/* Vòng viền trạng thái */}
      <div 
        className={`relative rounded-full p-[3px] transition-all duration-300 ${stateData.pulse ? 'animate-pulse' : ''}`}
        style={{ background: `linear-gradient(135deg, ${agent.color}, ${stateData.color})` }}
      >
        <div className="bg-slate-900 rounded-full p-[2px]">
          <div 
            className={`relative rounded-full overflow-hidden bg-slate-800 ${sizeClasses[size]} transition-transform duration-300 group-hover:scale-105 shadow-md`}
            style={{ borderColor: agent.color, borderWidth: '2px' }}
          >
            {/* Hình ảnh Avatar thực tế */}
            {!imageError ? (
              <img
                src={agent.avatarPath}
                alt={`${agent.name} - ${agent.title}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              // Fallback UI nếu ảnh lỗi hoặc chưa có
              <div 
                className="w-full h-full flex flex-col items-center justify-center text-white font-bold"
                style={{ backgroundColor: `${agent.color}40` }}
              >
                <span className="text-xl">{agent.name.charAt(0)}</span>
              </div>
            )}
            
            {/* Lớp overlay khi hover */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-white text-xs font-semibold text-center px-1">
                {agent.gender}, {agent.age}t
              </span>
            </div>
          </div>
        </div>

        {/* Biểu tượng trạng thái nhỏ ở góc */}
        <div 
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] shadow-lg"
          title={stateData.label}
        >
          {stateData.icon}
        </div>
      </div>

      {/* Tên tiếng Việt 2 chữ & Chức danh chuyên môn */}
      <div className="mt-3 text-center w-full px-1">
        <h4 className="text-base font-bold text-white tracking-wide group-hover:text-blue-400 transition-colors">
          {agent.name}
        </h4>
        <p className="text-xs font-semibold mt-0.5 line-clamp-1" style={{ color: agent.color }}>
          {agent.title}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <span 
            className="w-2 h-2 rounded-full inline-block" 
            style={{ backgroundColor: stateData.color }}
          ></span>
          <span className="text-[11px] text-slate-400 font-medium">
            {stateData.label}
          </span>
        </div>
      </div>
    </div>
  );
};
