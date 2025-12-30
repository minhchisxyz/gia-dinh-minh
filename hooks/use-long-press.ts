import { useCallback, useRef, useState } from "react"

const useLongPress = (
    onLongPress: () => void,
    { delay = 500 } = {}
) => {
    const timeout = useRef<NodeJS.Timeout | null>(null)
    const isLongPress = useRef(false)

    const start = useCallback(() => {
        isLongPress.current = false
        timeout.current = setTimeout(() => {
            onLongPress()
            isLongPress.current = true
        }, delay)
    }, [onLongPress, delay])

    const clear = useCallback(() => {
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
    }, [])

    const onClick = useCallback((e: React.MouseEvent) => {
        if (isLongPress.current) {
            e.preventDefault()
            e.stopPropagation()
        }
    }, [])

    return {
        onMouseDown: start,
        onTouchStart: start,
        onMouseUp: clear,
        onMouseLeave: clear,
        onTouchEnd: clear,
        onClick
    }
}

export default useLongPress

