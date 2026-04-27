import { type Manuscript, STATUS_CONFIG, WORKFLOW_STEPS } from "../../../data/manuscripts";

interface WorkflowStepperProps {
  manuscript: Manuscript;
}

export function WorkflowStepper({ manuscript }: WorkflowStepperProps) {
  const currentStep = STATUS_CONFIG[manuscript.status].step;
  const isRejected = manuscript.status === "rejected";

  return (
    <div style={{ padding: "24px 0 8px" }}>
      <div className="flex items-start">
        {WORKFLOW_STEPS.map((step, i) => {
          const stepNum = i + 1;
          const completed = currentStep > stepNum;
          const active = currentStep === stepNum;
          const rejected = isRejected && stepNum >= currentStep;

          return (
            <div key={step.key} className="flex items-start flex-1">
              {/* Node + label */}
              <div className="flex flex-col items-center" style={{ flex: "0 0 auto", minWidth: 0 }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: rejected
                      ? "rgba(224,82,82,0.08)"
                      : completed
                      ? "#3ecf8e"
                      : active
                      ? "#0b0b0b"
                      : "#f2f2f2",
                    border: active ? "2px solid #0b0b0b" : "2px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: completed ? "#fff" : active ? "#fff" : "#ccc",
                    flexShrink: 0,
                    transition: "all 0.35s ease",
                  }}
                >
                  {completed ? "✓" : stepNum}
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    marginTop: "6px",
                    color: active ? "#0b0b0b" : completed ? "#3ecf8e" : "#bbb",
                    textAlign: "center",
                    fontWeight: active ? 600 : 400,
                    maxWidth: "58px",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector line */}
              {i < WORKFLOW_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    marginTop: "14px",
                    background: completed ? "#3ecf8e" : "#f0f0f0",
                    transition: "background 0.35s ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
