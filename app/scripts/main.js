function closeNav() {
  document.querySelector(".sidebar").style.width = "0";
}

$(".navbar-toggler").click(function () {
  $(".sidebar").css("width", $(".sidebar").width() === 0 ? "100%" : "0");
});

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const tenisName = urlParams.get("tenis");

  if (tenisName) {
    const loggedIn = localStorage.getItem('loggedin') === 'true';

    fetch("tenis.json")
      .then((response) => response.json())
      .then((data) => {
        const tenis = data.tenis.find((t) => t.name === tenisName);

        if (tenis) {
          const imageGallery = createImageGallery(tenis.images);
          const productInfo = createProductInfo(
            tenis.name,
            tenis.price,
            tenis.priceParcelado,
            tenis.gender,
            tenis.sizes,
            tenis.stock,
            loggedIn
          );

          document.getElementById("image-gallery").innerHTML = imageGallery;
          document.getElementById("product-info").innerHTML = productInfo;

          const buyButton = document.querySelector('.adicionar-carrinho');
          if (buyButton) {
            buyButton.addEventListener('click', function() {
              if (loggedIn) {
                const selectedTenis = {
                  name: tenis.name,
                  gender: tenis.gender,
                  size: localStorage.getItem('selectedSize'),
                  price: tenis.price.toFixed(2),
                };

                localStorage.setItem('selectedTenis', JSON.stringify(selectedTenis));

                window.location.href = "app/pages/perfil/perfil.html";
              } else {
                console.error('Usuário não está logado. Redirecionar para a página de login ou exibir mensagem.');
              }
            });
          }
        } else {
          console.error(`Tênis com o nome "${tenisName}" não encontrado.`);
        }
      })
      .catch((error) =>
        console.error("Erro ao carregar dados do arquivo JSON:", error)
      );
  } else {
    console.error("Nome do tênis não fornecido como parâmetro de consulta.");
  }
});

function createImageGallery(images) {
  return `
        <ul class="imagens-grid">
            ${images
              .map(
                (img) =>
                  `<li class="imagens-lista"><span><img class="imagem-tenis" src="${img}"></span></li>`
              )
              .join("")}
        </ul>
    `;
}

function createProductInfo(name, price, priceParcelado, gender, sizes, stock, loggedIn) {
  const dropdown = `
        <div class="tamanho-quantidade">
            <div class="dropdown">
                <button class="dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    TAMANHO
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    ${sizes
                      .map(
                        (size) =>
                          `<a class="dropdown-item" onclick="handleSizeSelection('${size}')">${size}</a><div class="dropdown-divider"></div>`
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `;

  const stockInfo = `
        <div class="estoque">
            <span class="estoque-situacao">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 1.875C12.1549 1.875 14.2215 2.73102 15.7452 4.25476C17.269 5.77849 18.125 7.84512 18.125 10C18.125 12.1549 17.269 14.2215 15.7452 15.7452C14.2215 17.269 12.1549 18.125 10 18.125C7.84512 18.125 5.77849 17.269 4.25476 15.7452C2.73102 14.2215 1.875 12.1549 1.875 10C1.875 7.84512 2.73102 5.77849 4.25476 4.25476C5.77849 2.73102 7.84512 1.875 10 1.875ZM10 20C12.6522 20 15.1957 18.9464 17.0711 17.0711C18.9464 15.1957 20 12.6522 20 10C20 7.34784 18.9464 4.8043 17.0711 2.92893C15.1957 1.05357 12.6522 0 10 0C7.34784 0 4.8043 1.05357 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 12.6522 1.05357 15.1957 2.92893 17.0711C4.8043 18.9464 7.34784 20 10 20ZM14.4141 8.16406C14.7812 7.79688 14.7812 7.20313 14.4141 6.83984C14.0469 6.47656 13.4531 6.47266 13.0898 6.83984L8.75391 11.1758L6.91797 9.33984C6.55078 8.97266 5.95703 8.97266 5.59375 9.33984C5.23047 9.70703 5.22656 10.3008 5.59375 10.6641L8.09375 13.1641C8.46094 13.5312 9.05469 13.5312 9.41797 13.1641L14.4141 8.16406Z" fill="#33D17A"/>
                </svg>
            </span>
            <span class="estoque-situacao">
                ${stock ? "Em estoque" : "Sem estoque"}
            </span>
        </div>
    `;

  const addToCartButton = loggedIn
    ? `
    <div class="botao-adicionar">
        <button class="adicionar-carrinho" type="button" onclick="handleBuy()">COMPRAR</button>
    </div>
  `
    : `
    <div class="botao-adicionar">
        <button class="adicionar-carrinho" type="button" data-toggle="modal" data-target="#myModal">COMPRAR</button>
    </div>
  `;

  return `
        <div class="info-imagens">
            <h1 class="nome-tenis">${name}</h1>
            <div class="genero">
                <span class="genero-titulo">${gender}</span>
            </div>
            <div class="preco-produto">
                <p class="preco">R$ ${price.toFixed(2)}</p>
                <span class="preco-parcelado">Ou 10x de R$ ${priceParcelado.toFixed(
                  2
                )}</span>
            </div>
            ${dropdown}
            ${stockInfo}
            ${addToCartButton}
        </div>
    `;
}

window.handleSizeSelection = function(size) {
  localStorage.setItem('selectedSize', size);
};


let sneakersData;
let appliedFilters = {};

function applyFilters() {
  const sneakersContainer = document.getElementById("sneakers-container");
  sneakersContainer.innerHTML = "";

  let filteredSneakers = sneakersData.sneakers;

  if (appliedFilters.price) {
    filteredSneakers = filteredSneakers.filter((sneaker) => {
      const price = sneaker.price;
      return (
        price >= appliedFilters.price.min && price <= appliedFilters.price.max
      );
    });
  }

  if (appliedFilters.sort) {
    filteredSneakers = filteredSneakers.sort((a, b) => {
      if (
        appliedFilters.sort === "menor-preco" ||
        appliedFilters.sort === "maior-preco"
      ) {
        return appliedFilters.sort === "menor-preco"
          ? a.price - b.price
          : b.price - a.price;
      } else if (
        appliedFilters.sort === "alfabetica" ||
        appliedFilters.sort === "alfabetica-reversa"
      ) {
        return appliedFilters.sort === "alfabetica"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });
  }

  filteredSneakers.forEach((sneaker) => {
    const sneakerDiv = createSneakerDiv(sneaker);
    sneakersContainer.appendChild(sneakerDiv);
  });
}

function createSneakerDiv(sneaker) {
  const sneakerDiv = document.createElement("div");
  sneakerDiv.classList.add("col-6", "col-sm-6", "col-lg-3");

  sneakerDiv.innerHTML = `
          <div class="produto">
            <a class="produtos" aria-label="${
              sneaker.name
            }" href="app/pages/tenis/tenis.html?tenis=${encodeURIComponent(
    sneaker.name
  )}">
              <div class="imagem-produto">
                <span>
                  <img class="imagem-tenis d-block" alt="Masculino" src="${
                    sneaker.image
                  }">
                </span>
              </div>
              <div class="nome-preco">
                <p class="nome-tenis">${sneaker.name}</p>
                <div class="preco-valor">
                  <p class="preco">R$ ${sneaker.price.toFixed(2)}</p>
                </div>
              </div>
            </a>
          </div>
        `;

  return sneakerDiv;
}

document.getElementById("reset-filters").addEventListener("click", () => {
  appliedFilters = {};
  applyFilters();
});

document.querySelectorAll(".dropdown-item").forEach((item) => {
  item.addEventListener("click", () => {
    const filterType = item.getAttribute("data-filter");
    const sortType = item.getAttribute("data-sort");

    if (filterType) {
      appliedFilters[filterType] = {
        min: parseFloat(item.getAttribute("data-min")),
        max: parseFloat(item.getAttribute("data-max")),
      };
    } else {
      appliedFilters.price = null;
    }

    appliedFilters.sort = sortType;

    applyFilters();
  });
});

fetch("produtos.json")
  .then((response) => response.json())
  .then((data) => {
    sneakersData = data;
    applyFilters();
  })
  .catch((error) =>
    console.error("Erro ao obter dados do arquivo JSON:", error)
  );






    document.addEventListener('DOMContentLoaded', () => {
  const loggedIn = localStorage.getItem('loggedin');
  let formData;

  try {
    formData = JSON.parse(localStorage.getItem('formData')) || {};
    console.log('formData:', formData);
  } catch (error) {
    formData = {};
    console.error('Erro ao obter formData do localStorage:', error);
  }

  console.log('loggedIn:', loggedIn);

  if (loggedIn) {
    console.log('Usuário logado');
  
        const userInfoContainer = document.getElementById('user-info');
  
        if (userInfoContainer) {
          const cadastroLink = document.getElementById('cadastro-link');
  
          if (cadastroLink) {
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = 'Logout / Sair';
            logoutLink.style.textDecoration = 'none';
            logoutLink.style.color = 'black';
            logoutLink.addEventListener('click', handleLogout);
  
            cadastroLink.parentNode.replaceChild(logoutLink, cadastroLink);
          } else {
            console.error('Elemento #cadastro-link não encontrado na página.');
          }
  
          const loginLink = document.getElementById('login-link');
          const pipeLink = document.getElementById('pipe-link');
          if (loginLink) loginLink.style.display = 'none';
          if (pipeLink) pipeLink.style.display = 'none';
  
          const searchIcons = document.querySelectorAll('.busca_icones .Favoritos_compras');
          searchIcons.forEach(icon => {
            icon.removeAttribute('data-toggle');
            icon.removeAttribute('data-target');
            icon.addEventListener('click', handleIconClick);
          });
  
          const minhaContaLink = document.querySelector('.minha-conta-link');
          const botaoMinhaConta = document.querySelector('.botao-minha-conta');
  
          minhaContaLink.addEventListener('click', () => {
            window.location.href = 'app/pages/perfil/perfil.html';
          });
  
          botaoMinhaConta.textContent = 'LOGOUT / SAIR';
          botaoMinhaConta.addEventListener('click', handleLogout);
        } else {
          console.error('Elemento #user-info não encontrado na página.');
        }
      } else {
        console.log('Usuário não logado');
  
        localStorage.setItem('redirectUrl', window.location.href);
  
        showLoginModal(formData);
      }
    });
  
    function handleLogout(event) {
      event.preventDefault();
  
      localStorage.setItem('redirectUrl', window.location.href);
  
      localStorage.removeItem('loggedin');
  
      const redirectUrl = localStorage.getItem('redirectUrl') || 'index.html';
      window.location.href = redirectUrl;
    }
  
    function handleIconClick(event) {
      event.preventDefault();
  
      const iconId = event.currentTarget.id;
      const loggedIn = localStorage.getItem('loggedin');
  
      if (loggedIn) {
        if (iconId === 'search-icon' || iconId === 'outro-icon') {
          window.location.href = 'app/pages/perfil/perfil.html';
        }
      } else {
      }
    }
  
    function showLoginModal(formData) {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const emailErrorMessage = document.getElementById('emailErrorMessage');
      const passwordErrorMessage = document.getElementById('passwordErrorMessage');

      emailErrorMessage.textContent = '';
      passwordErrorMessage.textContent = '';

      if (email === formData.campo0 && password === formData.campo2) {
        console.log('Login bem-sucedido');

        localStorage.setItem('loggedin', 'true');

        $('#myModal').modal('hide');

        const redirectUrl = localStorage.getItem('redirectUrl') || 'index.html';

        window.location.href = redirectUrl;
      } else {
        if (emailErrorMessage && email !== formData.campo0) {
          emailErrorMessage.textContent = 'Email incorreto';
        }

        if (passwordErrorMessage && password !== formData.campo2) {
          passwordErrorMessage.textContent = 'Senha incorreta';
        }
      }
    });
  } else {
    console.error('Elemento #loginForm não encontrado na página.');
  }
}