
interface GenreBadgeProps {
    name: string;
}

export default function GenreBadge({ name }: GenreBadgeProps) {
    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(98, 0, 234, 0.1)', // Light purple bg
            fontSize: '0.75rem',
            color: '#6200ea', // Primary color text
            border: '1px solid rgba(98, 0, 234, 0.2)',
            marginRight: '6px',
            display: 'inline-block',
            fontWeight: 600
        }}>
            {name}
        </span>
    );
}
