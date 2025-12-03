// components/profile.js
import { getData, getSession, updateData } from "../services/supaservice.js";

export { renderProfile };

function renderProfile() {
    const div = document.createElement("div");
    div.className = "container mt-4";
    div.innerHTML = `
        <h2>Mi Perfil</h2>
        <div id="profileInfo" class="mt-3">
            <p>Cargando información del perfil...</p>
        </div>
    `;

    const loadProfile = async () => {
        const userId = getSession();
        if (!userId) {
            div.querySelector("#profileInfo").innerHTML = `
                <div class="alert alert-warning">
                    Debes iniciar sesión para ver tu perfil.
                    <a href="#login" class="alert-link">Iniciar sesión</a>
                </div>
            `;
            return;
        }

        try {
            const profile = await getData("profiles", { id: userId });
            if (profile && profile[0]) {
                const userProfile = profile[0];
                div.querySelector("#profileInfo").innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${userProfile.username || 'Usuario'}</h5>
                            <p class="card-text"><strong>Email:</strong> ${localStorage.getItem('user') || 'No disponible'}</p>
                            <p class="card-text"><strong>Nombre completo:</strong> ${userProfile.full_name || 'No especificado'}</p>
                            <p class="card-text"><strong>Website:</strong> ${userProfile.website || 'No especificado'}</p>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            div.querySelector("#profileInfo").innerHTML = `
                <div class="alert alert-danger">
                    Error al cargar el perfil: ${error.message}
                </div>
            `;
        }
    };

    loadProfile();
    return div;
}

class GameProfile extends HTMLElement {
    connectedCallback() {
        this.appendChild(renderProfile());
    }
}

customElements.define('game-profile', GameProfile);