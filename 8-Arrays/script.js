'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// ---------- Lecture: Creating DOM Elements ----------

// Boa prática: Em vez de trabalhar com variáveis globais, procurar passar os dados que a função precisa diretamente na função;

const displayMovements = function (movements, sort = false) {
  // limpando o container antes de inserir as movement_rows;
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements; // Event Handler ("Sorting arrays" lecture)
  movs.forEach(function (mov, i) {
    // variável que define se é um deposito ou retirada;
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // template string com o html que será inserido no Movements Container;
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>
  `;
    // inserindo o html do template acima, no movements container;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Calc Balance - ("The Reduce method" lecture)

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = `${acc.balance}€`;
};

// Calc Display Summary - ("The magic of chaining methods" lecture)

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(deposit => deposit > 0)
    .reduce((acc, deposit) => acc + deposit, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(withdrawal => withdrawal < 0)
    .reduce((acc, withdrawal) => acc + withdrawal, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(deposit => deposit > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

// ---------- Lecture: Computing Usernames ----------
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

// Update UI function ("Implementing Transfer" lecture)

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);
  // Display balance
  calcDisplayBalance(acc);
  // Display summary
  calcDisplaySummary(acc);
};

// Event Handler ("Implementing Login" lecture)
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // Previne o form de submeter

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI e mensagem de boas vindas
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    updateUI(currentAccount);
  }
});

// Event Handler ("Implementing Transfers" lecture)
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  console.log(amount + '-->' + receiverAcc);

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Transferindo
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // Atualizando a UI
    updateUI(currentAccount);
  }
});
// Event Handler ("Some and every" lecture)

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Adicionar movement
    currentAccount.movements.push(amount);

    // Atualizar UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});
// Event Handler ("The findIndex method" lecture)

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    // Deletar a conta
    accounts.splice(index, 1);
    // Esconder a UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

// Event Handler ("Sorting arrays" lecture)
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
// /////////////////////////////////////////////////
// /////////////////////////////////////////////////
// // NOTES

// // const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// /////////////////////////////////////////////////

// // ---------- Notes about the Lecture: Simple Array Methods ----------

// // let arr = ['a', 'b', 'c', 'd', 'e'];

// // // - SLICE METHOD - Quase igual ao método de mesmo nome usado em strings

// // // NÂO ALTERA o array original;

// // console.log(arr.slice(2)); // retorna um novo array, "fatiado" a partir do index passado como argumento

// // console.log(arr.slice(2, 4)); // passando index de início e de final (somente o do início é incluso no array retornado). Nesse caso, somente os indexes 2 e 3 serão inclusos;
// // // o Length do array retornado é o parâmetro final - o parâmetro inícial.

// // console.log(arr.slice(-2)); // valores negativos fatiam o array de trás para frente;

// // console.log(arr.slice(-1)); // o valor -1 sempre trará o último elemento do array;

// // console.log(arr.slice(1, -2)); // extrai a partir do index 1, deixando de fora os 2 últimos elementos;

// // console.log(arr.slice()); // não utilizar nenhum argumento resulta em uma "shallow copy";

// // console.log([...arr]); // o mesmo resultado de não usar nenhum argumento. A escolha entre as duas maneiras é apenas questão de preferência;

// // // - SPLICE METHOD

// // // parecido com o SLICE, porém ALTERA o array original;

// // // console.log(arr.splice(2)); // extrai os elementos a partir do index 2, assim como o SLICE;

// // console.log(arr); // podemos ver aqui que o array original foi alterado, permanecendo apenas o que não foi extraído pelo splice acima;

// // // o splice é usado normalmente para remover elementos de um array, quase sempre o último; Exemplo abaixo:

// // console.log(arr.splice(-1));
// // console.log(arr);

// // arr.splice(1, 2); // o segundo parâmetro serve para especificar quantos elementos serão deletados. Nesse caso, a partir do index 1, serão deletados 2 elementos (B e C);
// // console.log(arr);

// // // - REVERSE METHOD - inverte a ordem dos elementos

// // // esse método ALTERA o array original

// // arr = ['a', 'b', 'c', 'd', 'e'];

// // const arr2 = ['j', 'i', 'h', 'g', 'f']; // apenas um array com ordem incorreta;

// // console.log(arr2.reverse()); // retorna o array na ordem reversa / contrária;

// // // - CONCAT METHOD

// // // NÂO ALTERA os arrays originais;

// // const letters = arr.concat(arr2); // retorna os dois arrays concatenados;
// // console.log(letters);
// // console.log([...arr, ...arr2]); // mesmo resultado, também sem alterar os arrays originais. Novamente: a escolha entre as duas maneiras é apenas questão de preferência

// // // JOIN METHOD

// // console.log(letters.join(' - ')); // retorna uma string com os elementos do array separados pelo separador definido no argumento;

// // ---------- Notes about the Lecture: Looping Arrays - forEach ----------

// // const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // // array loop com for of
// // for (const movement of movements) {
// //   if (movement > 0) console.log(`Deposit value: $${movement},00.`);
// //   else console.log(`Withdraw value: $${Math.abs(movement)},00.`);
// // }

// // // array loop com forEach
// // // o método forEach recebe como argumento uma callback function e, como argumento dessa callback function, está sendo passado o elemento correspondente à execução atual do forEach.
// // console.log('--------------- FOREACH ---------------');
// // movements.forEach(function (movement, index, array) {
// //   if (movement > 0)
// //     console.log(`Movement ${index + 1}: You deposited $${movement},00.`);
// //   else
// //     console.log(
// //       `Movement ${index + 1}: You withdrew $${Math.abs(movement)},00.`
// //     );
// // });

// // // Exemplificação da execução:
// // // Cada execução do forEach, chamará a função anônima callback com o valor do elemento atual do array;
// // // 0: function(200)
// // // 1: function(450)
// // // 2: function(-400)

// // // Acessando o index com for of:
// // for (const [i, movement] of movements.entries()) {
// //   if (movement > 0)
// //     console.log(`Movement ${i + 1}: You deposited $${movement},00.`);
// //   else
// //     console.log(`Movement ${i + 1}: You withdrew $${Math.abs(movement)},00.`);
// // }

// // // Acessar o index com o forEach é mais fácil, pois no momento que a callback function é acionada, é passado não somente o elemento atual do array, mas o index e também o próprio array, respectivamente. No exemplo do forEach mais acima podemos ver os argumentos passados na função callback (movements, index, array). Pode ser passado somente o primeiro, os dois primeiros, ou todos os três, não importa. O que importa é a ordem, pois sempre deve ser respeitada essa ordem utilizada: 1 - elemento do array, 2 - index desse elemento e 3 - o próprio array (inteiro);

// // // OBS: a ordem é o inverso do método entries. O entries retorna primeiro o index, depois o elemento. Já no forEach, primeiro é o elemento, depois o index, seguido do próprio array;

// // // Quando usar forEach e quando usar For of?
// // // o forEach não pode ser interrompido. "Break" e "continue" não funcionam. Então sempre que for necessário interromper um loop em determinado momento, deve-se usar o for of, do contrário, novamente é questão de preferência do desenvolvedor.

// // ---------- Notes about the Lecture: forEach with Maps and Sets ----------

// // // Map
// // // Assim como em arrays, o forEach pode ser usado em Maps e Sets.
// // // Em um Map, a função callback também pode receber 3 argumentos, sendo eles o valor atual, a key e o map inteiro, respectivamente. Praticamente a mesma coisa que com arrays;
// // const currencies = new Map([
// //   ['USD', 'United States dollar'],
// //   ['EUR', 'Euro'],
// //   ['GBP', 'Pound sterling'],
// // ]);

// // currencies.forEach(function (value, key, map) {
// //   console.log(`${key}: ${value}`);
// // });

// // // Set

// // const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// // console.log(currenciesUnique);

// // // No caso dos Sets, não faz sentido o segundo parâmetro por conta dos valores não possuírem uma key nem index. Para evitar confusão com dois forEachs diferentes, foi mantido o mesmo padrão. Então, a segunda variável é simplesmente ignorada, já que significa o mesmo que a primeira. O último parâmetro retorna o próprio set.
// // // OBS: usar o "_" para variáveis completamente desnecessárias é um tipo de padrão adotado pelos desenvolvedores.
// // currenciesUnique.forEach(function (value, _, map) {
// //   console.log(`${value}: ${value}`);
// //   console.log(map);
// // });

// // ---------- (Notes) Lecture - Data Transformations: map, filter, reduce ----------

// // --- Map ---
// // Executa um loop em um array assim como o forEach, porém criando um novo array. Além disso, é passada uma função callback que pode executar uma operação no elemento atual do array a cada iteração. Por exemplo, multiplicar cada elemento de um array de números, por 2, resultando em um novo array em que cada elemento seja o produto dessa operação.
// // [3, 1, 4, 3, 2] -> map(current * 2) -> [6, 2, 8, 6, 4]

// // --- Filter ---
// // O filter permite filtrar elementos de um array que satisfaçam uma determinada condição. Por exemplo, filtrar e incluir no novo array retornado pelo filter, apenas os elementos que sejam maior que 2 (current > 2) em um array de números.
// // [3, 1, 4, 3, 2] -> filter(current > 2) -> [3, 4, 3]

// // --- Reduce ---
// // Reduce permite "reduzir" todos os elementos do array a um único valor. Por exemplo, somar todos os elementos utilizando uma variável para acumula-los (snowball effect). Esse exemplo da soma é apenas uma das operações que podem ser aplicadas.
// // Aqui, não há um novo array retornado, apenas o valor "reduzido".
// // [3, 1, 4, 3, 2] -> reduce(acc + current) -> 13

// // ---------- (Notes) Lecture - The Map method ----------

// // const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // const euroToUsd = 1.1;

// // const movementsUSD = movements.map(function (mov) {
// //   return mov * euroToUsd;
// //   // poderia ser retornado qualquer coisa aqui para ocupar a posição atual do array, por exemplo:
// //   // return 23;
// //   // isso resultaria em um array de mesmo length, mas com 23 em todas as posições;
// // });

// // // assim como no forEach, também foi passado como argumento da callback function, o elemento atual do array. O Map, assim como o forEach, tem acesso às mesmas 3 variáveis: elemento atual do array, index e o próprio array;
// // // na callback function deve ser retornado o valor que queremos no novo array, na posição atual;

// // console.log(movements);
// // console.log(movementsUSD);

// // // obtendo o mesmo resultado com for of:
// // const movementsUSDfor = [];

// // for (const mov of movements) movementsUSDfor.push(mov * euroToUsd);
// // console.log(movementsUSDfor);
// // // ambos resolvem o problema, mas são filosofias diferentes. Com o map, estamos mais alinhados com o paradigma Functional Programming, que é para onde o JS moderno tende a ir (segundo o Jonas);

// // // Simplificando o map com uma arrow function
// // const movementsUSDarrow = movements.map(mov => mov * euroToUsd);
// // console.log(movementsUSDarrow);

// // // Usando os 3 argumentos
// // const movementDescriptions = movements.map(
// //   (mov, i, arr) =>
// //     `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} $${Math.abs(
// //       mov
// //     )},00.`
// // );

// // console.log(movementDescriptions);

// // ---------- (Notes) Lecture - The Filter method ----------

// // const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // const deposits = movements.filter(function (mov) {
// //   return mov > 0;
// // });
// // console.log(deposits);

// // // deposits com for of
// // const depositsFor = [];
// // for (const mov of movements) if (mov > 0) depositsFor.push(mov);
// // console.log(depositsFor);

// // // OBS: filter tambem dá acesso às outras duas variáveis (elemento atual, index e array)
// // // As vantagens de usar o filter (assim como os demais métodos) em vez do 'for of' é a aproximação da programação mais funcional (?) e também que esses métodos permitem realizar o encadeamento uns dos outros, o que seria impossível com 'for of';

// // // Small challenge - Criar uma variável para as retiradas (withdrawals) também utilizando o filter:

// // const withdrawals = movements.filter(mov => mov < 0);
// // console.log(withdrawals);

// // ---------- (Notes) Lecture - The Reduce method ----------

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // balance com reduce + regular function
// // const balance = movements.reduce(function (acc, cur, i, arr) {
// //   console.log(`Iteration number ${i}: ${acc}`);
// //   return acc + cur;
// // }, 0);

// // balance com reduce + arrow function;
// const balance = movements.reduce((acc, cur) => acc + cur, 0);

// // Diferente dos métodos anteriores, a callback function do reduce recebe como primeiro argumento um acumulador (Snowball);
// // Além disso, o reduce recebe um segundo argumento, depois da callback function, que é o valor inicial do acumulador;
// console.log(balance);

// // balance com for of
// let balance2 = 0;
// for (const mov of movements) balance2 += mov;
// console.log(balance2);

// // Uma vantagem de usar os métodos citados até aqui, é que evitamos usar essas variáveis externas que podem ser incômodas quando se tem muitas delas no código;

// // maximum value

// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) return acc;
//   else return mov;
// }, movements[0]);

// console.log(max);

// ---------- (Notes) Lecture - The magic of chaining methods ----------

// const euroToUsd = 1.1;
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const totalDepositsUSD = movements
//   .filter(mov => mov > 0)
//   .map(mov => mov * euroToUsd)
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(totalDepositsUSD);

// ---------- (Notes) Lecture - The find Method ----------

// // Mais um método que executa um loop no array
// // Diferente do Filter, não retorna um novo array, mas sim o primeiro elemento que satisfaz a condição imposta;
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(firstWithdrawal);

// const account = accounts.find(account => account.owner === 'Jessica Davis');
// console.log(account);

// // encontrando a conta da Jessica Davis com o For-of
// let accountForOf;
// for (const account of accounts) {
//   if (account.owner === 'Jessica Davis') {
//     accountForOf = account;
//     break;
//   }
// }
// console.log(accountForOf);

// ---------- (Notes) Lecture - Some and every ----------

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// console.log(movements);

// console.log(movements.includes(-130));
// // Some
// const anyDeposit = movements.some(mov => mov > 0);
// console.log(anyDeposit);

// // includes faz checa por igualdade;
// // some checa se algum valor corresponde à condição especificada;
// // ambos retornam um booleano

// // Every
// console.log(movements.every(mov => mov > 0));
// console.log(account4.movements.every(mov => mov > 0));

// // Every somente retorna true se TODOS os elementos do array corresponderem à condição

// // Callback separada
// const depositFn = mov => mov > 0;
// console.log(movements.some(depositFn));
// console.log(movements.every(depositFn));
// console.log(movements.filter(depositFn));

// ---------- (Notes) Lecture - Flat and FlatMap ----------

// // Achata os arrays aninhados em um único array com todos os valores;
// const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
// console.log(arr.flat());

// // no exemplo abaixo, vemos que o método flat só adentra 1 nível nos arrays aninhados;
// // caso haja arrays aninhados dentro de arrays aninhados, eles não serão achatados;
// // Para isso, podemos usar o argumento "depth", que permite especificar a profundidade em que o array será achatado. O padrão é 1;
// const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
// console.log(arrDeep.flat(2));

// // calcular o balance de todas as contas usando encadeamento de métodos;
// const overallBalance = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((accum, mov) => accum + mov, 0);

// console.log(overallBalance);

// // executar o map seguido de flat em um array é algo bastante comum. Por isso foi implementado o método flatMap, que faz exatamente a mesma coisa, mas num único método, sendo esse mais performático;
// // OBS: CASO SEJA NECESSÁRIO USAR O FLAT COM PROFUNDIDADE MAIOR QUE 1, É PRECISO USA-LO SEPARADAMENTE, POIS O FLAT MAP NÃO RECEBE COMO ARGUMENTO O DEPTH;
// const overallBalance2 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((accum, mov) => accum + mov, 0);

// console.log(overallBalance2);

// ---------- (Notes) Lecture - Sorting arrays ----------

// // Strings
// const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
// console.log(owners.sort());
// // ALTERA O ARRAY ORIGINAL

// // Numbers
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// // console.log(movements.sort()); // Não funciona como esperado porque o sort ordena o array baseado em strings;

// // return < 0 ---- A, B
// // return > 0 ---- B, A (inverte a ordem)

// // Crescente
// // movements.sort((a, b) => {
// //   if (a > b) return 1;
// //   if (a < b) return -1;
// // });
// movements.sort((a, b) => a - b);
// console.log(movements);

// // Decrescente
// // movements.sort((a, b) => {
// //   if (a > b) return -1;
// //   if (a < b) return 1;
// // });
// movements.sort((a, b) => b - a);
// console.log(movements);

// ---------- (Notes) Lecture - More Ways of Creating and Filling arrays ----------

// const arr = [1, 2, 3, 4, 5, 6, 7];
// console.log(new Array(1, 2, 3, 4, 5, 6, 7));

// // "new Array" constructor com apenas 1 argumento cria um array vazio com o length indicado;
// const x = new Array(7);
// console.log(x);

// // Array vazio + método fill
// // o único método que pode ser usado em um array vazio como esse é o fill, que vai preencher o array todo caso não sejam determinados os index de ínicio e de final;
// // altera o array original;
// // também pode ser aplicado a arrays não vazios;
// x.fill(1, 3);
// console.log(x);

// arr.fill(23, 2, 6);
// console.log(arr);

// // Array.from
// // O método from está sendo chamado na função-objeto Array (Array constructor);
// // Nele, passamos como primeiro argumento um objeto contendo o length do array + um map como segundo argumento;

// const y = Array.from({ length: 7 }, () => 1);
// console.log(y);

// const z = Array.from({ length: 7 }, (_, i) => i + 1); // _ sendo usado para nomear parâmetro não utilizado / desnecessário à expressão;
// console.log(z);

// // Assignment: criar um array formado por 100 jogadas de dado aleatórias;
// const diceRolls = Array.from(
//   { length: 100 },
//   () => Math.trunc(Math.random() * 6) + 1
// );
// console.log(diceRolls);

// // Array.from foi inicialmente introduzido no JS para criar arrays a partir de estruturas parecidas com arrays (iteráveis), como Maps, Sets ou Strings. Porém além destes exemplos de iteráveis, também temos o querySelectorAll que gera um NodeList, que por sua vez parece um Array, mas não é. Portanto, caso precisemos utilizar métodos como reduce ou map em um NodeList, primeiro precisamos transformá-lo em um array

// labelBalance.addEventListener('click', function () {
//   const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value'),
//     el => Number(el.textContent.replace('€', ''))
//   );
//   console.log(movementsUI);

//   // também é possível criar um array a partir do NodeList usando o operador Spread. Porém assim é preciso realizar o Map separadamente;
//   const movementsUI2 = [...document.querySelectorAll('.movements__value')];
//   console.log(movementsUI2);
// });

// ---------- (Notes) Lecture - Array methods practice ----------

// 1 - Calcular a soma de todos os depósitos
const allDepositsSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0);
console.log(allDepositsSum);

// 2 - Calcular quantos depósitos acima de 1000 foram feitos
const depositsAbove1000 = accounts
  // Solução simples
  // .flatMap(acc => acc.movements)
  // .filter(mov => mov >= 1000).length;

  // Solução com reduce
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);

console.log(depositsAbove1000);

// 3 - Somar todos os depósitos e todos as retiradas usando o reduce (exemplo mais avançado de uso do método);

const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur; // cleaner
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(deposits, withdrawals);

// 4 - Converter strings para TitleCase

const convertTitleCase = function (title) {
  const capitilize = str => str[0].toUpperCase() + str.slice(1);

  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitilize(word)))
    .join(' ');
  return capitilize(titleCase);
};

console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not to long'));
console.log(convertTitleCase('and this is another title with an EXAMPLE'));
