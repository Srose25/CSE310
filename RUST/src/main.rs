//! A small Tamagotchi-style desktop prototype built with Rust and egui.

use std::{path::Path, time::{Duration, Instant}};

use eframe::egui::{self, ColorImage, Context, Pos2, Rect, TextureHandle, TextureOptions, Vec2};
use rand::Rng;

//Assets will need to be placed in target/release/assets to work properly.
const SPRITE_FRAME_1_PATH: &str = "assets/sprite_frame_1.png";
const SPRITE_FRAME_2_PATH: &str = "assets/sprite_frame_2.png";
const SPRITE_FRAME_3_PATH: &str = "assets/sprite_frame_3.png";
const BUTTON_1_PATH: &str = "assets/button_1.png";
const BUTTON_2_PATH: &str = "assets/button_2.png";
const BUTTON_3_PATH: &str = "assets/button_3.png";

const PIXEL_SCALE: f32 = 12.0;
const PET_SIZE: f32 = 8.0 * PIXEL_SCALE;
const BUTTON_SIZE: f32 = 8.0 * PIXEL_SCALE;

const BACKGROUND_COLOR: egui::Color32 = egui::Color32::from_rgb(0xFF, 0xFF, 0xFF);

/// Describes the short animation the pet plays after the user selects an emote.
#[derive(Clone, Copy, PartialEq)]
enum Emote { Shake, Jump, Anger }

/// Keeps the pet's current autonomous-movement state.
struct PetState {
    position: Pos2,
    destination: Pos2,
    facing_right: bool,
    at_destination: bool,
    looking_until: Option<Instant>,
    wait_until: Instant,
}

/// Owns the egui app's UI state, animation state, and loaded textures.
struct SpritePetApp {
    pet: PetState,
    menu_open: bool,
    selected_emote: usize,
    active_emote: Option<(Emote, Instant)>,
    frame_1: Option<TextureHandle>,
    frame_2: Option<TextureHandle>,
    frame_3: Option<TextureHandle>,
    button_1: Option<TextureHandle>,
    button_2: Option<TextureHandle>,
    button_3: Option<TextureHandle>,
}

/// Starts the native desktop window and hands control to eframe's event loop.
fn main() -> eframe::Result {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default().with_inner_size([640.0, 480.0]),
        ..Default::default()
    };
    eframe::run_native("Sprite Pet", options, Box::new(|cc| Ok(Box::new(SpritePetApp::new(cc)))))
}

impl SpritePetApp {
    /// Creates initial state and attempts to load each optional PNG texture.
    fn new(cc: &eframe::CreationContext<'_>) -> Self {
        let now = Instant::now();
        Self {
            let mut visuals = egui::Visuals::light();
            visuals.panel_fill = BACKGROUND_COLOR;
            visuals.window_fill = BACKGROUND_COLOR;
            visuals.widgets.noninteractive.bg_fill = BACKGROUND_COLOR;
            visuals.widgets.inactive.bg_fill = BACKGROUND_COLOR;
            visuals.widgets.hovered.bg_fill = BACKGROUND_COLOR;
            visuals.widgets.active.bg_fill = BACKGROUND_COLOR;
            cc.egui_ctx.set_visuals(visuals);
            pet: PetState { position: Pos2::new(320.0, 220.0), destination: Pos2::new(320.0, 220.0), facing_right: false, at_destination: true, looking_until: None, wait_until: now + Duration::from_secs(2) },
            menu_open: false,
            selected_emote: 0,
            active_emote: None,
            frame_1: load_texture(&cc.egui_ctx, "sprite-frame-1", SPRITE_FRAME_1_PATH),
            frame_2: load_texture(&cc.egui_ctx, "sprite-frame-2", SPRITE_FRAME_2_PATH),
            frame_3: load_texture(&cc.egui_ctx, "sprite-frame-3", SPRITE_FRAME_3_PATH),
            button_1: load_texture(&cc.egui_ctx, "button-1", BUTTON_1_PATH),
            button_2: load_texture(&cc.egui_ctx, "button-2", BUTTON_2_PATH),
            button_3: load_texture(&cc.egui_ctx, "button-3", BUTTON_3_PATH),
        }
    }

    /// Advances autonomous movement: choose one of five stops, walk there, look around, then wait.
    fn update_pet_ai(&mut self, bounds: Rect) {
        let now = Instant::now();
        if let Some(look_end) = self.pet.looking_until {
            self.pet.facing_right = (now.elapsed().as_millis() / 180) % 2 == 0;
            if now >= look_end {
                self.pet.looking_until = None;
                self.pet.wait_until = now + Duration::from_secs(rand::rng().random_range(1..=30));
            }
            return;
        }
        let distance = self.pet.position.distance(self.pet.destination);
        if distance < 2.0 && !self.pet.at_destination {
            self.pet.position = self.pet.destination;
            self.pet.at_destination = true;
            self.pet.looking_until = Some(now + Duration::from_secs(1));
            return;
        }
        if self.pet.at_destination {
            if now >= self.pet.wait_until { self.choose_destination(bounds); }
            return;
        }
        let direction = (self.pet.destination - self.pet.position).normalized();
        self.pet.facing_right = direction.x > 0.0;
        self.pet.position += direction * 1.2;
    }

    /// Randomly chooses one of the center, two-left, or two-right positions for the pet to visit.
    fn choose_destination(&mut self, bounds: Rect) {
        let center_x = bounds.center().x;
        let offsets = [-180.0, -90.0, 0.0, 90.0, 180.0];
        let index = rand::rng().random_range(0..offsets.len());
        self.pet.destination = Pos2::new(center_x + offsets[index], bounds.center().y);
        self.pet.at_destination = false;
    }

    /// Handles the left button by opening the emote menu or advancing its cursor.
    fn move_menu_cursor(&mut self) {
        self.menu_open = true;
        self.selected_emote = (self.selected_emote + 1) % 3;
    }

    /// Handles the center button by starting the currently highlighted emote.
    fn select_emote(&mut self) {
        if !self.menu_open { self.menu_open = true; return; }
        let emote = [Emote::Shake, Emote::Jump, Emote::Anger][self.selected_emote];
        self.active_emote = Some((emote, Instant::now()));
    }

    /// Handles the right button by closing the emote menu and cancelling no animation.
    fn go_back(&mut self) { self.menu_open = false; }

    /// Draws a provided image button, or a readable text fallback until its PNG is supplied.
    fn image_button(ui: &mut egui::Ui, texture: &Option<TextureHandle>, fallback: &str) -> egui::Response {
        match texture {
            Some(texture) => ui.add(egui::ImageButton::new(egui::Image::new(texture).fit_to_exact_size(Vec2::splat(BUTTON_SIZE)))),
            None => ui.add_sized(Vec2::splat(BUTTON_SIZE), egui::Button::new(fallback)),
        }
    }

    /// Draws the pet using the correct animation frame and applies its temporary movement offset.
    fn draw_pet(&mut self, ui: &mut egui::Ui) {
        let (emote, started) = self.active_emote.unwrap_or((Emote::Shake, Instant::now() - Duration::from_secs(9)));
        let elapsed = started.elapsed().as_secs_f32();
        if elapsed > 1.2 { self.active_emote = None; }
        let (texture, offset) = match self.active_emote.map(|v| v.0) {
            Some(Emote::Shake) => (self.frame_2.as_ref(), Vec2::new((elapsed * 24.0).sin() * 12.0, 0.0)),
            Some(Emote::Jump) => (self.frame_2.as_ref(), Vec2::new(0.0, -(elapsed * std::f32::consts::PI).sin().max(0.0) * 55.0)),
            Some(Emote::Anger) => (self.frame_3.as_ref(), Vec2::new((elapsed * 60.0).sin() * 7.0, 0.0)),
            None => (self.frame_1.as_ref(), Vec2::ZERO),
        };
        let top_left = self.pet.position + offset - Vec2::splat(PET_SIZE / 2.0);
        if let Some(texture) = texture {
            let uv = if self.pet.facing_right { Rect::from_min_max(Pos2::new(1.0, 0.0), Pos2::new(0.0, 1.0)) } else { Rect::from_min_max(Pos2::ZERO, Pos2::new(1.0, 1.0)) };
            ui.painter().image(texture.id(), Rect::from_min_size(top_left, Vec2::splat(PET_SIZE)), uv, egui::Color32::WHITE);
        } else {
            ui.painter().text(self.pet.position + offset, egui::Align2::CENTER_CENTER, "PET", egui::FontId::proportional(18.0), egui::Color32::BLACK);
        }
    }
}

impl eframe::App for SpritePetApp {
    /// Repaints the immediate-mode UI every frame, updates the AI, and reacts to button clicks.
    fn update(&mut self, ctx: &Context, _frame: &mut eframe::Frame) {
        ctx.request_repaint();
            // CHANGE `BACKGROUND_COLOR` above to alter this #FFFFFF game canvas.
            egui::CentralPanel::default().frame(egui::Frame::default().fill(BACKGROUND_COLOR)).show(ctx, |ui| {
            let full = ui.max_rect();
            let play_area = Rect::from_min_max(full.min, Pos2::new(full.max.x, full.max.y - BUTTON_SIZE - 32.0));
            self.update_pet_ai(play_area);
            self.draw_pet(ui);
            if self.menu_open {
                ui.allocate_ui_at_rect(Rect::from_center_size(Pos2::new(full.center().x, 70.0), Vec2::new(220.0, 105.0)), |ui| {
                    ui.group(|ui| {
                        ui.label("Emotes");
                        for (index, name) in ["Shake", "Jump", "Anger"].iter().enumerate() {
                            ui.label(format!("{} {name}", if index == self.selected_emote { ">" } else { " " }));
                        }
                    });
                });
            }
            ui.allocate_ui_at_rect(Rect::from_min_size(Pos2::new(full.center().x - BUTTON_SIZE * 1.7, full.max.y - BUTTON_SIZE - 16.0), Vec2::new(BUTTON_SIZE * 3.4, BUTTON_SIZE)), |ui| {
                ui.horizontal(|ui| {
                    if Self::image_button(ui, &self.button_1, "MOVE").clicked() { self.move_menu_cursor(); }
                    if Self::image_button(ui, &self.button_2, "SELECT").clicked() { self.select_emote(); }
                    if Self::image_button(ui, &self.button_3, "BACK").clicked() { self.go_back(); }
                });
            });
        });
    }
}

/// Loads a PNG as an egui texture; returning None keeps the app usable until that asset is added.
fn load_texture(ctx: &Context, name: &str, path: &str) -> Option<TextureHandle> {
    // Prefer the project-relative asset during development, then look beside
    // the compiled executable so a double-clicked release build also works.
    let requested_path = Path::new(path);
    let executable_asset = std::env::current_exe()
        .ok()
        .and_then(|executable| executable.parent().map(|folder| folder.join(path)));
    let image_path = if requested_path.exists() {
        requested_path.to_path_buf()
    } else {
        executable_asset?
    };
    let image = image::open(image_path).ok()?.to_rgba8();
    let size = [image.width() as usize, image.height() as usize];
    Some(ctx.load_texture(name, ColorImage::from_rgba_unmultiplied(size, image.as_raw()), TextureOptions::NEAREST))
}
