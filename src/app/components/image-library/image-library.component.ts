
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ImageLibraryService } from './image-library.service';
import { AnnotationToolsService } from '../annotation-tools/annotation-tools.service';

@Component({
  selector: 'rx-image-library',
  templateUrl: './image-library.component.html',
  styleUrls: ['./image-library.component.scss']
})
export class ImageLibraryComponent implements OnInit {
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  images: ImageData[] = [];
  opened$ = this.service.opened$;
  ImageData: any; 

  constructor(private imageUploadService: ImageLibraryService,private readonly service: AnnotationToolsService,) { }
  ngOnInit(): void {
    this.getImage();
  }
  getImage() {
    const storedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    if (storedImages.length > 0) {
      this.images = storedImages.map((imageObject, index) => {
        const byteArray = new Uint8Array(imageObject.imageData);
        const blob = new Blob([byteArray], { type: imageObject.imageType });
        const imageSrc = URL.createObjectURL(blob);
        return {
          id: index,
          src: imageSrc,
          height: 150,
          width: 200
        };
      });
      console.log('Images retrieved successfully:', this.images);
    } else {
      console.log('No images found in local storage.');
    }
  
    // this.imageUploadService.getAllImages().subscribe(
    //   async response => {
    //     const imagePromises = response.map(item =>
    //       this.convertBase64ToBlob(item.imageData).then(blob => ({
    //         id: item.id,
    //         src: URL.createObjectURL(blob),
    //         height: 150,
    //         width: 200
    //       }))
    //     );
  
    //     const resolvedImages = await Promise.all(imagePromises);
    //     this.images = resolvedImages;
    //     console.log('Images retrieved successfully:', this.images);
    //   },
    //   error => {
    //     console.error('Error retrieving images:', error);
    //   }
    // );
  }
  



  convertBase64ToBlob(base64Data: string): Promise<Blob> {
    // Ensure the base64Data starts with the expected prefix
    const base64Prefix = 'data:image/png;base64,';
    let actualBase64String = base64Data;
  
    // Check if the base64Data needs to be stripped of the prefix
    if (actualBase64String.startsWith(base64Prefix)) {
      actualBase64String = actualBase64String.substring(base64Prefix.length);
    }
  
    return new Promise((resolve, reject) => {
      try {
        const byteCharacters = atob(actualBase64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        resolve(new Blob([byteArray], { type: 'image/png' }));
      } catch (error) {
        reject(error);
      }
    });
  }
  
  handleImageUpload(event: any) {
    const files = event.target.files;
    const uploadPromises: Promise<void>[] = [];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
  
      const uploadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = (e) => {
          const imageDataWithPrefix = e.target?.result as string;
  
          // Dynamically determine the prefix and remove it
          const base64Index = imageDataWithPrefix.indexOf('base64,') + 'base64,'.length;
          const imageData = imageDataWithPrefix.substring(base64Index);
  
          const imageName = file.name;
          const imageType = file.type;
  
          // Convert base64 string to byte array
          const byteCharacters = atob(imageData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
  
          // Create an object to store in local storage
          const imageObject = {
            imageData: Array.from(byteArray),
            imageName: imageName,
            imageType: imageType
          };
          const storedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
          storedImages.push(imageObject);
          localStorage.setItem('uploadedImages', JSON.stringify(storedImages));
  
          resolve(); // Resolve the promise after storing the image
        };
  
        reader.onerror = (error) => {
          reject(error); // Reject the promise if there's an error
        };
  
        // Read the file as data URL
        reader.readAsDataURL(file);
      });
  
      uploadPromises.push(uploadPromise); // Push the upload promise to the array
    }
  
    // Wait for all uploads to finish before refreshing the images list
    Promise.all(uploadPromises).then(() => {
      this.getImage(); // Refresh the images list after all uploads are complete
    });
  }
  
  
  deleteImage(index: number): void {
    let images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    
    if (index > -1 && index < images.length) {
      images.splice(index, 1);
      localStorage.setItem('uploadedImages', JSON.stringify(images));
      this.getImage();
    } else {
      console.error('Invalid index for deleting Image');
    }
  }
  onPanelClose(): void {
    this.onClose.emit();
  }
  
}  
