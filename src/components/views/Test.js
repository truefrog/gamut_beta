// import * as React from 'react';
// import {Select,IconButton} from '@mui/material/';
// import CloseRounded from '@mui/icons-material/CloseRounded';
// import Option from '@mui/joy/Option';

// export default function Test() {
//   const [value, setValue] = React.useState('dog');
//   const action = React.useRef(null);
//   return (
//     <Select
//       action={action}
//       value={value}
//       placeholder="Favorite pet…"
//       onChange={(e, newValue) => setValue(newValue)}
//       {...(value && {
//         // display the button and remove select indicator
//         // when user has selected a value
//         endDecorator: (
//           <IconButton
//             size="sm"
//             variant="plain"
//             color="neutral"
//             onMouseDown={(event) => {
//               // don't open the popup when clicking on this button
//               event.stopPropagation();
//             }}
//             onClick={() => {
//               setValue(null);
//               action.current?.focusVisible();
//             }}
//           >
//             <CloseRounded />
//           </IconButton>
//         ),
//         indicator: null,
//       })}
//       sx={{ minWidth: 160 }}
//     >
//       <Option value="dog">Dog</Option>
//       <Option value="cat">Cat</Option>
//       <Option value="fish">Fish</Option>
//       <Option value="bird">Bird</Option>
//     </Select>
//   );
// }

import React from 'react'

function Test() {
  return (
    <div>Test</div>
  )
}

export default Test