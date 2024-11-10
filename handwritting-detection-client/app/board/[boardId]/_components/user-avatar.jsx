"use client";

import { Hint } from "../../../../components/hint";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/UI/avatar"

const UserAvatar = ({
  src,
  name,
  fallback,
  borderColor
}) => {
  return (
    <Hint label={name || "Teammate"} side="bottom" sideOffset={20}>
      <Avatar className="h-8 w-8 border-2" style={{ borderColor }}>
        <AvatarImage src={src} />
        <AvatarFallback className="text-xs font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
    </Hint>
  )
}

export default UserAvatar;