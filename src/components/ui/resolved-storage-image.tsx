"use client"

import { useEffect, useState } from "react"
import { getSignedUrlAction } from "@/actions/storage"
import { getExternalUrl } from "@/lib/utils"

interface ResolvedStorageImageProps {
    src?: string | null
    alt: string
    className?: string
    fallback?: string
}

export function ResolvedStorageImage({
    src,
    alt,
    className,
    fallback = "https://placehold.co/800x450?text=Imagen"
}: ResolvedStorageImageProps) {
    const [resolvedSrc, setResolvedSrc] = useState("")

    useEffect(() => {
        let isMounted = true

        const resolve = async () => {
            if (!src) {
                if (isMounted) setResolvedSrc("")
                return
            }

            const externalUrl = getExternalUrl(src)
            if (externalUrl) {
                if (isMounted) setResolvedSrc(externalUrl)
                return
            }

            try {
                const signedUrl = await getSignedUrlAction(src)
                if (isMounted) setResolvedSrc(signedUrl || src)
            } catch {
                if (isMounted) setResolvedSrc(src)
            }
        }

        resolve()
        return () => { isMounted = false }
    }, [src])

    if (!src) return null

    return (
        <img
            src={resolvedSrc || fallback}
            alt={alt}
            className={className}
            onError={(event) => {
                event.currentTarget.src = fallback
            }}
        />
    )
}
