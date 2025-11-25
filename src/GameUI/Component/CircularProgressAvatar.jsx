const CircularProgressAvatar = ({
    avatar,
    progress = 75,
    size = 120,
    strokeWidth = 8,
    borderWidth = 2
}) => {
    const progressRadius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * progressRadius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const progressCircleStyle = {
        strokeDasharray: `${circumference} ${circumference}`,
        strokeDashoffset: strokeDashoffset,
        transform: `rotate(90deg)`,
        transformOrigin: 'center',
    };
    const avatarSize = size - (strokeWidth + 1);
    const containerStyle = {
        width: size,
        height: size,
    };
    return (
        <div className="HeadBox" style={containerStyle}>
            <svg className="progress-ring" shapeRendering="geometricPrecision" width={size} height={size}>
                <circle
                    className="progress-ring__circle progress-ring__circle--background"
                    cx={size / 2}
                    cy={size / 2}
                    r={progressRadius}
                />

                <circle
                    className="progress-ring__circle progress-ring__circle--progress"
                    cx={size / 2}
                    cy={size / 2}
                    r={progressRadius}
                    style={progressCircleStyle}
                />
            </svg>
            <img
                src={avatar}
                alt="Profile"
                className="avatar-img"
                style={{ width: avatarSize, height: avatarSize }}
            />
        </div>
    );
};

export default CircularProgressAvatar