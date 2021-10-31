import { useUI } from "@components/ui/context";
import React, { FC } from "react";

const Overlay: FC = () => {
  const { overlay, hideOverlay } = useUI()
    return (
      <>
        {overlay && (
          <div
            className="absolute bg-gray-500 h-full opacity-75 top-0 w-full z-10"
            // onClick={hideOverlay}
          ></div>
        )}
      </>
    )
}

export default Overlay;