import { domAnimation } from "framer-motion";

// Loaded on demand by MotionProvider. domAnimation covers animate/exit and the
// tap, hover and focus gestures the layout components use; it leaves out drag
// and layout projection, which is what makes it much smaller than `motion`.
export default domAnimation;
