import { useRouter } from "next/navigation";
import { CrowdfundingIcon, PersonIcon } from "./icons/BadgeIcons";
import { StarIcon } from "./icons/BadgeIcons";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Gavel,
  Lock,
  Archive,
} from "lucide-react";
import type { Dispute } from "@/hooks/useDisputeList";

const getIconByCategory = (category: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("tech")) return "/images/icons/bar-chart-icon.svg";
  if (cat.includes("freelance")) return "/images/icons/person-icon.svg";
  return "/images/icons/stellar-fund-icon.svg";
};

type DisputeUI = Dispute & {
  votesCount?: number;
  totalVotes?: number;
  prize?: string;
  icon?: string;
  voters?: Array<{ isMe: boolean; vote: number }>;
};

const VOTE_APPROVE = 1;

export const DisputeCard = ({ dispute }: { dispute: DisputeUI }) => {
  const router = useRouter();

  const handleReadDispute = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/disputes/${dispute.id}`);
  };

  const handleWithdraw = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/execute-ruling/${dispute.id}`);
  };

  // Status mapping from Contract/Adapter
  // 0: Created, 1: Commit (Voting), 2: Reveal, 3: Finished
  const isVoting = dispute.status === 1;
  const isReveal = dispute.status === 2;
  const isFinished = dispute.status === 3;

  // Check if "Execute Ruling" button should appear (Status 2 + time passed, handled by hook usually, but simplified here)
  const isReadyForWithdrawal =
    dispute.status === 2 && dispute.phase === "WITHDRAW";

  // Find user's vote if available
  const myVote = dispute.voters?.find((v) => v.isMe)?.vote;

  return (
    <div
      onClick={handleReadDispute}
      className="bg-white rounded-[24px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-gray-100 relative flex flex-col gap-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* 1. Header Section */}
      <div className="flex items-start gap-4">
        <div className="w-[52px] h-[52px] shrink-0 rounded-2xl bg-[#8c8fff]/10 border border-[#8c8fff]/20 flex items-center justify-center overflow-hidden">
          {dispute.icon ? (
            <img
              src={dispute.icon}
              alt={dispute.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={getIconByCategory(dispute.category)}
              alt={dispute.category}
              className="w-6 h-6 object-contain opacity-80"
            />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <h3 className="font-manrope font-extrabold text-[15px] text-[#1b1c23] leading-tight truncate pr-2 group-hover:text-[#8c8fff] transition-colors">
            {dispute.title}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F6F9] border border-gray-100">
              <CrowdfundingIcon size={10} color="#8c8fff" />
              <span className="font-manrope font-bold text-[10px] text-[#1b1c23] uppercase tracking-wide">
                {dispute.category}
              </span>
            </div>
            {/* Show Vote Count only if active */}
            {!isFinished && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F6F9] border border-gray-100">
                <PersonIcon size={10} color="#8c8fff" />
                <span className="font-manrope font-bold text-[10px] text-[#1b1c23] tracking-wide">
                  {dispute.votesCount || 0}/{dispute.jurorsRequired} jurors
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Status / Context Area */}
      <div className="bg-[#F8F9FC] rounded-xl p-4 flex items-center gap-3 border border-gray-50">
        {/* CASE A: User Voted */}
        {myVote !== undefined ? (
          <>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                myVote === VOTE_APPROVE
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {myVote === VOTE_APPROVE ? (
                <CheckCircle2 size={16} />
              ) : (
                <XCircle size={16} />
              )}
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Your vote was:
              </span>
              <span className="text-sm font-bold text-[#1b1c23]">
                {myVote === VOTE_APPROVE
                  ? "Party A (Claimant)"
                  : "Party B (Defendant)"}
              </span>
            </div>
          </>
        ) : (
          /* CASE B: User Didn't Vote (Check Status!) */
          <>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
              {isFinished ? (
                <Archive size={16} />
              ) : isReveal ? (
                <Lock size={16} />
              ) : (
                <Gavel size={16} />
              )}
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Status
              </span>
              <span className="text-xs font-bold text-[#1b1c23]">
                {isFinished
                  ? "Case Resolved"
                  : isReveal
                    ? "Reveal Phase In Progress"
                    : isVoting
                      ? "Voting In Progress"
                      : "Waiting for judgment"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 3. Footer Section */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <StarIcon size={14} color="#8c8fff" />
          <span className="font-manrope font-bold text-xs text-[#8c8fff]">
            {dispute.stake} USDC
          </span>
        </div>

        {isReadyForWithdrawal ? (
          <button
            onClick={handleWithdraw}
            className="flex items-center gap-2 bg-[#1b1c23] text-white px-5 py-2.5 rounded-full font-manrope font-bold text-xs hover:bg-[#2c2d33] transition-all shadow-md active:scale-95"
          >
            <Wallet size={12} />
            <span>Withdraw</span>
          </button>
        ) : (
          <button
            onClick={handleReadDispute}
            className="flex items-center gap-2 bg-[#8c8fff] text-white px-5 py-2.5 rounded-full font-manrope font-bold text-xs hover:bg-[#7a7dd6] transition-all shadow-md shadow-[#8c8fff]/20 active:scale-95 group-hover:scale-105"
          >
            <span>Read Dispute</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
