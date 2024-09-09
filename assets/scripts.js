let currentImageIndex = 0;
let activeTag = 'all';

document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.querySelector('.gallery');

    if (gallery) {
        initializeGallery(gallery, {
            columns: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 3
            },
            lightBox: true,
            lightboxId: 'myAwesomeLightbox',
            showTags: true,
            tagsPosition: 'top'
        });
    }
});

function initializeGallery(gallery, options) {
    const tagsCollection = new Set();
    createRowWrapper(gallery);

    if (options.lightBox) { 
        createLightBox(gallery, options.lightboxId);
    }

    const galleryItems = gallery.querySelectorAll('.gallery-item');
    galleryItems.forEach((item) => {
        responsiveImageItem(item);
        moveItemInRowWrapper(gallery, item);
        wrapItemInColumn(item, options.columns);
        const theTag = item.getAttribute('data-gallery-tag');
        if (options.showTags && theTag && !tagsCollection.has(theTag)) {
            tagsCollection.add(theTag);
        }
    });

    if (options.showTags) {
        showItemTags(gallery, options.tagsPosition, Array.from(tagsCollection));
    }

    // Ajout d'un écouteur d'événement pour chaque image pour afficher la lightbox
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            if (options.lightBox && this.tagName === 'IMG') {
                openLightBox(this, options.lightboxId);
            }
        });
    });

    gallery.style.display = 'block';
}

function createRowWrapper(element) {
    const firstChild = element.firstElementChild;
    if (!firstChild || !firstChild.classList.contains('row')) {
        const rowWrapper = document.createElement('div');
        rowWrapper.classList.add('gallery-items-row', 'row');
        element.appendChild(rowWrapper);
    }
}

function wrapItemInColumn(element, columns) {
    const column = document.createElement('div');
    column.classList.add('item-column', 'mb-4');

    if (typeof columns === 'object') {
        if (columns.xs) column.classList.add(`col-${Math.ceil(12 / columns.xs)}`);
        if (columns.sm) column.classList.add(`col-sm-${Math.ceil(12 / columns.sm)}`);
        if (columns.md) column.classList.add(`col-md-${Math.ceil(12 / columns.md)}`);
        if (columns.lg) column.classList.add(`col-lg-${Math.ceil(12 / columns.lg)}`);
        if (columns.xl) column.classList.add(`col-xl-${Math.ceil(12 / columns.xl)}`);
    } else if (typeof columns === 'number') {
        column.classList.add(`col-${Math.ceil(12 / columns)}`);
    } else {
        console.error(`Les colonnes doivent être un nombre ou un objet.`);
    }

    element.parentElement.insertBefore(column, element);
    column.appendChild(element); // Déplacer l'élément dans la colonne
}

function moveItemInRowWrapper(gallery, item) {
    const rowWrapper = gallery.querySelector('.gallery-items-row');
    rowWrapper.appendChild(item);
}

function responsiveImageItem(element) {
    if (element.tagName === 'IMG') {
        element.classList.add('img-fluid');
    }
}

function createLightBox(gallery, lightboxId) {
    const lightbox = document.createElement('div');
    lightbox.id = lightboxId || 'galleryLightbox';
    lightbox.classList.add('modal', 'fade');
    lightbox.innerHTML = `
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&lt;</div>
                    <img class="lightboxImage img-fluid" alt="Image Lightbox">
                    <div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">&gt;</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Ajout des écouteurs d'événements pour les flèches de navigation
    const prevButton = lightbox.querySelector('.mg-prev');
    const nextButton = lightbox.querySelector('.mg-next');

    prevButton.addEventListener('click', function() {
        showPrevImage(gallery);
    });

    nextButton.addEventListener('click', function() {
        showNextImage(gallery);
    });
}


function openLightBox(element, lightboxId) {
    const lightboxImage = document.querySelector(`#${lightboxId} .lightboxImage`);
    const images = Array.from(document.querySelectorAll('.gallery-item'))
        .filter(item => activeTag === 'all' || item.getAttribute('data-gallery-tag') === activeTag); // Filtre les images par catégorie active
    currentImageIndex = images.indexOf(element); // Index de l'image cliquée
    lightboxImage.src = element.src; // Affiche l'image sélectionnée
    const modal = new bootstrap.Modal(document.getElementById(lightboxId));
    modal.show();
}


function showPrevImage(gallery) {
    const images = Array.from(gallery.querySelectorAll('.gallery-item'))
        .filter(item => activeTag === 'all' || item.getAttribute('data-gallery-tag') === activeTag); // Filtre les images par catégorie active
    currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : images.length - 1; // Retour à la dernière image si on est sur la première
    const prevImage = images[currentImageIndex];
    document.querySelector('.lightboxImage').src = prevImage.src; // Met à jour l'image affichée
}

function showNextImage(gallery) {
    const images = Array.from(gallery.querySelectorAll('.gallery-item'))
        .filter(item => activeTag === 'all' || item.getAttribute('data-gallery-tag') === activeTag); // Filtre les images par catégorie active
    currentImageIndex = (currentImageIndex < images.length - 1) ? currentImageIndex + 1 : 0; // Retour à la première image si on est sur la dernière
    const nextImage = images[currentImageIndex];
    document.querySelector('.lightboxImage').src = nextImage.src; // Met à jour l'image affichée
}

function showItemTags(gallery, position, tags) {
    const tagList = document.createElement('ul');
    tagList.classList.add('my-4', 'tags-bar', 'nav', 'nav-pills');
    
    // Créer l'élément pour "Tous"
    const allTag = document.createElement('li');
    allTag.classList.add('nav-item');
    allTag.innerHTML = `<span class="nav-link active active-tag" data-images-toggle="all">Tous</span>`;
    tagList.appendChild(allTag);

    // Créer les autres éléments de tag
    tags.forEach(tag => {
        const tagItem = document.createElement('li');
        tagItem.classList.add('nav-item');
        tagItem.innerHTML = `<span class="nav-link" data-images-toggle="${tag}">${tag}</span>`;
        tagList.appendChild(tagItem);
    });

    // Insérer la liste des tags dans la galerie
    if (position === 'top') {
        gallery.prepend(tagList);
    } else {
        gallery.append(tagList);
    }

    // Écouteur d'événement pour filtrer par tag et changer la classe active
    tagList.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            // Supprimer la classe active des autres tags
            tagList.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            // Ajouter la classe active au tag cliqué
            this.classList.add('active');
            
            // Récupérer le tag sélectionné
            const selectedTag = this.getAttribute('data-images-toggle');
            filterByTag(selectedTag);
        });
    });
}

function filterByTag(tag) {
    activeTag = tag;  // Stocke le tag actif
    document.querySelectorAll('.gallery-item').forEach(item => {
        const parentColumn = item.closest('.item-column');
        if (tag === 'all' || item.getAttribute('data-gallery-tag') === tag) {
            parentColumn.style.display = 'block';
        } else {
            parentColumn.style.display = 'none';
        }
    });
}
