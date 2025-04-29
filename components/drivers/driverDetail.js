class DriverDetail extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
  
    connectedCallback() {
      this.render();
    }
  
    open() {
      this.shadowRoot.querySelector(".modal").style.display = "flex";
    }
  
    close() {
      this.shadowRoot.querySelector(".modal").style.display = "none";
    }
  
    render() {
      const name = this.getAttribute("name") || '';
      const image = this.getAttribute("image") || '';
      const team = this.getAttribute("team") || '';
      const bio = this.getAttribute("bio") || '';
  
      this.shadowRoot.innerHTML = `
        <style>
          .modal {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .content {
            background: #111;
            color: white;
            border: 3px solid red;
            padding: 2rem;
            border-radius: 10px;
            max-width: 600px;
            font-family: 'Poppins', sans-serif;
          }
          .content img {
            width: 100%;
            border-radius: 10px;
          }
          .close {
            margin-top: 1rem;
            display: inline-block;
            padding: 0.5rem 1rem;
            background: red;
            color: white;
            border: none;
            cursor: pointer;
          }
        </style>
        <div class="modal">
          <div class="content">
            <img src="${image}" alt="${name}">
            <h2>${name}</h2>
            <h4>Team: ${team}</h4>
            <p>${bio}</p>
            <button class="close">Close</button>
          </div>
        </div>
      `;
  
      this.shadowRoot.querySelector(".close").addEventListener("click", () => this.close());
    }
  }
  
  customElements.define('driver-detail', DriverDetail);
  