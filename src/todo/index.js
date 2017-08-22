// function addTodo (todo, createTime) {
//   console.log('creating todo: %s on time: %s',
//     todo, createTime)
// }
// export function getCommand (message, send) {
//   const [ topic, ...parameters ] = message.split(' ')
//   switch (topic) {
//     case 'add':
//       return {
//         topic,
//         do: event => {
//           addTodo(parameters.join(' '), event.timestamp)
//         }
//       }
//   }
//   return null
// }
