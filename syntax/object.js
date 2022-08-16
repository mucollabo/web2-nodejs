const members = ['charles', 'k8s', 'docker'];
// console.log(members[1]);

const roles = {
    'programmer': 'charels',
    'orchest': 'k8s',
    'container': 'docker'
}
// console.log(roles.orchest);
// console.log(roles['orchest']);

// let i = 0;
// while(i < members.length) {
//     console.log('array loop', members[i]);
//     i += 1;
// }

for (var name in roles) {
    console.log('object => ', name, 'value => ', roles[name]);
}
