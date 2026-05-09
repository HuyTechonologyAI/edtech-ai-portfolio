"use client";

import { Brain, Trophy, ArrowRight, Zap, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export default function QuizPage() {
  const [gameState, setGameState] = useState<"idle" | "loading" | "playing" | "finished">("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [topic, setTopic] = useState("");

  const leaderboard = [
    { rank: 1, name: "Nguyễn Văn A", score: 5, time: "1:14" },
    { rank: 2, name: "Trần Thị B", score: 4, time: "1:30" },
    { rank: 3, name: "Lê Văn C", score: 4, time: "2:01" },
  ];

  const startQuiz = async () => {
    setGameState("loading");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setGameState("playing");
      } else {
        setGameState("idle");
        alert("Lỗi từ AI: " + (data.error || "Vui lòng thử lại."));
      }
    } catch (error: any) {
      console.error(error);
      setGameState("idle");
      alert("Lỗi kết nối Server: " + error.message);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState("finished");
    }
  };

  return (
    <main className="flex-1 py-12 md:py-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background min-h-screen">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-secondary" />
            AI Dynamic <span className="text-secondary">Quiz</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Bộ câu hỏi được sinh ra hoàn toàn tự động bởi Google Gemini AI mỗi lần bạn bấm bắt đầu. Không bao giờ lặp lại!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Quiz Area */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative min-h-[500px] flex flex-col border-t border-l border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
            
            {gameState === "idle" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-secondary/10 border border-secondary/20 text-secondary rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,255,133,0.1)]">
                  <Zap className="w-10 h-10 animate-pulse drop-shadow-[0_0_8px_rgba(0,255,133,0.5)]" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Sẵn sàng thử thách?</h2>
                <p className="text-foreground/70 max-w-md mb-8">
                  Nhập chủ đề bạn muốn kiểm tra, AI sẽ đọc tài liệu và tự động "chế" ra 5 câu hỏi để đánh giá trình độ của bạn.
                </p>
                
                <div className="w-full max-w-md mb-8 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/50 to-secondary/10 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="VD: Chatbot AI, N8N, Prompt Engineering..."
                    className="relative w-full bg-background border border-white/10 rounded-full px-6 py-4 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50"
                  />
                </div>

                <button onClick={startQuiz} className="flex items-center gap-2 px-10 py-4 rounded-full bg-secondary text-black font-bold text-lg hover-glow transition-all hover:scale-105">
                  Bắt đầu ngay <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {gameState === "loading" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-secondary animate-pulse">Gemini đang soạn đề thi...</h3>
                <p className="text-sm text-foreground/50 mt-2">Đang nạp kiến thức từ lõi AI...</p>
              </div>
            )}

            {gameState === "playing" && questions.length > 0 && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-sm font-bold text-secondary bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-full">
                    Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                  </div>
                  <div className="text-sm font-bold text-secondary">
                    Điểm: {score}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentQuestionIndex}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                    className="flex-1 flex flex-col"
                    style={{ perspective: 1000 }}
                  >
                    <h3 className="text-xl md:text-2xl font-bold mb-8">
                      {questions[currentQuestionIndex].question}
                    </h3>

                    <div className="space-y-3 flex-1">
                      {questions[currentQuestionIndex].options.map((opt, idx) => {
                        const isCorrect = idx === questions[currentQuestionIndex].correctAnswer;
                        const isSelected = selectedOption === idx;
                        let btnClass = "bg-surface border-border hover:border-secondary/50 text-foreground";
                        
                        if (isAnswered) {
                          if (isCorrect) btnClass = "bg-secondary/10 border-secondary text-secondary shadow-[0_0_15px_rgba(0,255,133,0.2)]";
                          else if (isSelected && !isCorrect) btnClass = "bg-red-500/10 border-red-500 text-red-500";
                          else btnClass = "bg-surface border-border opacity-50";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(idx)}
                            disabled={isAnswered}
                            className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex justify-between items-center ${btnClass}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-secondary drop-shadow-[0_0_5px_rgba(0,255,133,0.5)]" />}
                            {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex justify-end"
                  >
                    <button 
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-8 py-3 rounded-full bg-secondary text-black font-bold hover-glow transition-all"
                    >
                      {currentQuestionIndex < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"} <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {gameState === "finished" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Trophy className="w-20 h-20 text-yellow-500 mb-6" />
                <h2 className="text-3xl font-bold mb-2">Hoàn thành!</h2>
                <p className="text-lg text-foreground/70 mb-6">
                  Bạn đã trả lời đúng <span className="font-bold text-secondary text-2xl mx-2">{score} / {questions.length}</span> câu hỏi.
                </p>
                <button onClick={startQuiz} className="px-8 py-3 rounded-full bg-secondary text-black font-bold hover-glow transition-all">
                  Thi lại với đề mới
                </button>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1 glass-panel rounded-3xl p-6 border-t border-l border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold">Bảng Xếp Hạng</h3>
            </div>
            
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 hover:bg-surface transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index === 0 ? 'bg-yellow-500 text-white' : 
                        index === 1 ? 'bg-gray-300 text-gray-800' : 
                        index === 2 ? 'bg-amber-700 text-white' : 
                        'bg-surface-200 text-foreground/70'}`}>
                      {user.rank}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-secondary">{user.score} pt</div>
                    <div className="text-xs text-foreground/50">{user.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
