"""
GAN Training Script for MemeGenius

This script trains a DCGAN (Deep Convolutional Generative Adversarial Network)
on the meme dataset. The trained generator can then produce new meme-like images.

CLIP is used as an additional loss signal to ensure generated images are
semantically meaningful.

Usage:
    python train_gan.py --epochs 50 --batch_size 32 --image_size 64

For best results, run on GPU (Google Colab recommended).
"""

import os
import argparse
import numpy as np
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from torchvision.utils import save_image
from PIL import Image
from tqdm import tqdm


# ============ DATASET ============

class MemeDataset(Dataset):
    """Custom dataset for loading meme images."""
    
    def __init__(self, root_dir, transform=None):
        self.root_dir = Path(root_dir)
        self.transform = transform
        self.image_files = [
            f for f in os.listdir(root_dir)
            if f.lower().endswith(('.jpg', '.jpeg', '.png'))
        ]
        print(f"Found {len(self.image_files)} images in dataset.")
    
    def __len__(self):
        return len(self.image_files)
    
    def __getitem__(self, idx):
        img_path = self.root_dir / self.image_files[idx]
        try:
            image = Image.open(img_path).convert('RGB')
            if self.transform:
                image = self.transform(image)
            return image
        except Exception:
            # Return a random image if this one fails
            return self.__getitem__((idx + 1) % len(self))


# ============ GAN ARCHITECTURE ============

class Generator(nn.Module):
    """DCGAN Generator - Generates 64x64 images from noise."""
    
    def __init__(self, nz=100, ngf=64, nc=3):
        super().__init__()
        self.main = nn.Sequential(
            # Input: nz x 1 x 1
            nn.ConvTranspose2d(nz, ngf * 8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(ngf * 8),
            nn.ReLU(True),
            # State: (ngf*8) x 4 x 4
            nn.ConvTranspose2d(ngf * 8, ngf * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 4),
            nn.ReLU(True),
            # State: (ngf*4) x 8 x 8
            nn.ConvTranspose2d(ngf * 4, ngf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 2),
            nn.ReLU(True),
            # State: (ngf*2) x 16 x 16
            nn.ConvTranspose2d(ngf * 2, ngf, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf),
            nn.ReLU(True),
            # State: ngf x 32 x 32
            nn.ConvTranspose2d(ngf, nc, 4, 2, 1, bias=False),
            nn.Tanh()
            # Output: nc x 64 x 64
        )
    
    def forward(self, input):
        return self.main(input)


class Discriminator(nn.Module):
    """DCGAN Discriminator - Classifies 64x64 images as real/fake."""
    
    def __init__(self, nc=3, ndf=64):
        super().__init__()
        self.main = nn.Sequential(
            # Input: nc x 64 x 64
            nn.Conv2d(nc, ndf, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            # State: ndf x 32 x 32
            nn.Conv2d(ndf, ndf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 2),
            nn.LeakyReLU(0.2, inplace=True),
            # State: (ndf*2) x 16 x 16
            nn.Conv2d(ndf * 2, ndf * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 4),
            nn.LeakyReLU(0.2, inplace=True),
            # State: (ndf*4) x 8 x 8
            nn.Conv2d(ndf * 4, ndf * 8, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 8),
            nn.LeakyReLU(0.2, inplace=True),
            # State: (ndf*8) x 4 x 4
            nn.Conv2d(ndf * 8, 1, 4, 1, 0, bias=False),
            nn.Sigmoid()
        )
    
    def forward(self, input):
        return self.main(input).view(-1, 1).squeeze(1)


# ============ CLIP LOSS ============

def get_clip_loss(generated_images, clip_model, clip_processor, text_prompt, device):
    """
    Compute CLIP-based loss to guide the GAN towards generating
    images that are semantically aligned with text prompts.
    """
    from torchvision.transforms.functional import resize, normalize
    
    # Resize generated images to CLIP input size (224x224)
    resized = torch.nn.functional.interpolate(generated_images, size=(224, 224), mode='bilinear')
    
    # Normalize for CLIP
    mean = torch.tensor([0.48145466, 0.4578275, 0.40821073]).to(device).view(1, 3, 1, 1)
    std = torch.tensor([0.26862954, 0.26130258, 0.27577711]).to(device).view(1, 3, 1, 1)
    resized = (resized + 1) / 2  # [-1,1] to [0,1]
    resized = (resized - mean) / std
    
    # Get image features from CLIP
    image_features = clip_model.get_image_features(pixel_values=resized)
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    
    # Get text features
    text_inputs = clip_processor(text=[text_prompt], return_tensors="pt", padding=True)
    text_inputs = {k: v.to(device) for k, v in text_inputs.items() if k in ['input_ids', 'attention_mask']}
    text_features = clip_model.get_text_features(**text_inputs)
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    
    # Cosine similarity loss (we want to maximize similarity, so minimize negative similarity)
    similarity = torch.cosine_similarity(image_features, text_features.expand(image_features.shape[0], -1))
    clip_loss = -similarity.mean()
    
    return clip_loss


# ============ TRAINING ============

def train(args):
    """Train the DCGAN with optional CLIP guidance."""
    
    # Setup
    device = torch.device("mps" if torch.backends.mps.is_available() else 
                         "cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on: {device}")
    
    base_dir = Path(__file__).parent.parent
    dataset_dir = base_dir / "meme_folder" / "media"
    output_dir = Path(__file__).parent / "gan_outputs"
    output_dir.mkdir(exist_ok=True)
    
    # Data transforms
    transform = transforms.Compose([
        transforms.Resize((args.image_size, args.image_size)),
        transforms.CenterCrop(args.image_size),
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
    ])
    
    dataset = MemeDataset(dataset_dir, transform=transform)
    dataloader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
    
    # Models
    nz = 100
    netG = Generator(nz=nz).to(device)
    netD = Discriminator().to(device)
    
    # Optimizers
    optimizerD = optim.Adam(netD.parameters(), lr=args.lr, betas=(0.5, 0.999))
    optimizerG = optim.Adam(netG.parameters(), lr=args.lr, betas=(0.5, 0.999))
    
    # Loss
    criterion = nn.BCELoss()
    
    # Optional CLIP model for guided generation
    clip_model = None
    clip_processor = None
    if args.use_clip:
        try:
            from transformers import CLIPModel, CLIPProcessor
            clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
            clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            clip_model.eval()
            print("CLIP model loaded for guided training.")
        except Exception as e:
            print(f"Could not load CLIP: {e}. Training without CLIP guidance.")
            clip_model = None
    
    # Fixed noise for visualization
    fixed_noise = torch.randn(16, nz, 1, 1, device=device)
    
    # Training loop
    print(f"\nStarting training for {args.epochs} epochs...")
    print(f"Dataset size: {len(dataset)}")
    print(f"Batch size: {args.batch_size}")
    print(f"Image size: {args.image_size}x{args.image_size}")
    print("-" * 50)
    
    for epoch in range(args.epochs):
        for i, real_images in enumerate(dataloader):
            batch_size = real_images.size(0)
            real_images = real_images.to(device)
            
            # Labels
            real_label = torch.ones(batch_size, device=device)
            fake_label = torch.zeros(batch_size, device=device)
            
            # ---- Train Discriminator ----
            netD.zero_grad()
            
            # Real
            output_real = netD(real_images)
            loss_d_real = criterion(output_real, real_label)
            loss_d_real.backward()
            
            # Fake
            noise = torch.randn(batch_size, nz, 1, 1, device=device)
            fake_images = netG(noise)
            output_fake = netD(fake_images.detach())
            loss_d_fake = criterion(output_fake, fake_label)
            loss_d_fake.backward()
            
            loss_d = loss_d_real + loss_d_fake
            optimizerD.step()
            
            # ---- Train Generator ----
            netG.zero_grad()
            
            output = netD(fake_images)
            loss_g = criterion(output, real_label)
            
            # Add CLIP loss if available
            clip_loss_val = 0
            if clip_model and args.clip_prompt:
                clip_loss = get_clip_loss(
                    fake_images, clip_model, clip_processor,
                    args.clip_prompt, device
                )
                loss_g = loss_g + args.clip_weight * clip_loss
                clip_loss_val = clip_loss.item()
            
            loss_g.backward()
            optimizerG.step()
            
            if i % 50 == 0:
                clip_info = f" | CLIP Loss: {clip_loss_val:.4f}" if clip_model else ""
                print(f"[{epoch+1}/{args.epochs}][{i}/{len(dataloader)}] "
                      f"Loss_D: {loss_d.item():.4f} | Loss_G: {loss_g.item():.4f}{clip_info}")
        
        # Save sample images
        if (epoch + 1) % 5 == 0 or epoch == 0:
            with torch.no_grad():
                fake_samples = netG(fixed_noise)
                save_image(fake_samples, output_dir / f"epoch_{epoch+1:03d}.png",
                          normalize=True, nrow=4)
    
    # Save generator
    model_path = Path(__file__).parent / "gan_generator.pth"
    torch.save(netG.state_dict(), model_path)
    print(f"\nTraining complete! Generator saved to: {model_path}")
    print(f"Sample images saved to: {output_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train DCGAN on meme dataset")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--image_size", type=int, default=64, help="Image size (64 or 128)")
    parser.add_argument("--lr", type=float, default=0.0002, help="Learning rate")
    parser.add_argument("--use_clip", action="store_true", help="Use CLIP guidance during training")
    parser.add_argument("--clip_prompt", type=str, default="a funny meme", help="CLIP text prompt for guidance")
    parser.add_argument("--clip_weight", type=float, default=0.1, help="Weight of CLIP loss")
    
    args = parser.parse_args()
    train(args)
