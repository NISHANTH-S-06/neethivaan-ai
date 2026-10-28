'use client';

interface TimelineProps {
  currentStatus: string;
}

const steps = [
  { key: 'created', label: 'Case Filed', icon: '📝' },
  { key: 'reviewing', label: 'Under Review', icon: '🔍' },
  { key: 'assigned', label: 'Lawyer Assigned', icon: '👨⚖️' },
  { key: 'in_progress', label: 'In Progress', icon: '⚙️' },
  { key: 'resolved', label: 'Resolved', icon: '✅' },
  { key: 'closed', label: 'Closed', icon: '🔒' },
];

export default function CaseTimeline({ currentStatus }: TimelineProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <div style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '20px',
        letterSpacing: '1px',
      }}>
        CASE PROGRESS
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isFuture = index > activeIndex;

          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                <div style={{
                  width: '44px', height: '44px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                  background: isCompleted
                    ? '#059669'
                    : isActive
                    ? '#C9A84C'
                    : 'rgba(255,255,255,0.05)',
                  border: isActive
                    ? '2px solid #C9A84C'
                    : isCompleted
                    ? '2px solid #059669'
                    : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 16px rgba(201,168,76,0.4)' : 'none',
                }}>
                  {isCompleted ? '✓' : step.icon}
                </div>
                <div style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: isActive
                    ? '#C9A84C'
                    : isCompleted
                    ? '#059669'
                    : 'rgba(255,255,255,0.3)',
                  fontWeight: isActive ? '600' : '400',
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </div>
                {isActive && (
                  <div style={{
                    marginTop: '4px',
                    fontSize: '10px',
                    background: '#C9A84C',
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: '600',
                  }}>
                    Current
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div style={{
                  width: '40px', height: '2px',
                  background: index < activeIndex
                    ? '#059669'
                    : 'rgba(255,255,255,0.1)',
                  margin: '0 4px',
                  marginBottom: '24px',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
