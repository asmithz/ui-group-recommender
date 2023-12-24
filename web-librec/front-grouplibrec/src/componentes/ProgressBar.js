import { useEffect, useState } from "react"

const ProgressBar = ({ loaded, t }) => {
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [loadingMessage, setLoadingMessage] = useState(t('main.loading.first.msg'))
    const [loadingMessageNumber, setLoadingMessageNumber] = useState(1);

    useEffect(() => {
        // reset
        setLoadingProgress(0)

        const increments = 35
        const intervalId = setInterval(() => {
            setLoadingProgress((prevProgress) => {
                const newProgress = prevProgress + increments;
                if (newProgress >= 100) {
                    clearInterval(intervalId)
                    return 100
                }
                if (newProgress >= 26 && newProgress < 52) {
                    setLoadingMessage(t('main.loading.second.msg'))
                    setLoadingMessageNumber(2);
                } else if (newProgress >= 52 && newProgress < 100) {
                    setLoadingMessage(t('main.loading.third.msg'))
                    setLoadingMessageNumber(3);
                }
                return newProgress
            });
        }, 4500)

        // Clear the interval when the component unmounts or when needed
        return () => clearInterval(intervalId);
    }, [])

    return (
        <div style={{ paddingTop: "240px" }}>
            <progress className="progress is-success" max="100"></progress>
            <div className="has-text-centered">
                <p className="is-size-4 has-text-weight-bold">
                    {loadingMessage}
                    <span className="loading">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </span>
                    <span>
                        ({loadingMessageNumber}/3)
                    </span>
                </p>
            </div>
        </div>
    )
}

export default ProgressBar