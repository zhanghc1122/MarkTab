use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            // When a second instance is launched, extract file path from args
            if let Some(file_path) = extract_file_path(&args) {
                let _ = app.emit("open-file", file_path);
            }
            // Bring the existing window to front
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            // Check for file path in command-line arguments on first launch
            let args: Vec<String> = std::env::args().collect();
            if let Some(file_path) = extract_file_path(&args) {
                let handle = app.handle().clone();
                // Delay emit to allow frontend to mount
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(500));
                    let _ = handle.emit("open-file", file_path);
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![open_default_apps_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Open Windows Settings -> Default Apps page so the user can set MarkTab as the default .md editor.
#[tauri::command]
fn open_default_apps_settings() {
    let _ = std::process::Command::new("cmd")
        .args(["/c", "start", "ms-settings:defaultapps"])
        .spawn();
}

/// Extract file path from command-line arguments.
/// Filters out the program name and flags, returns the first argument that looks like a file path.
fn extract_file_path(args: &[String]) -> Option<String> {
    args.iter()
        .skip(1) // Skip the program name
        .find(|arg| {
            // Skip empty strings and flags
            !arg.is_empty() && !arg.starts_with('-')
        })
        .cloned()
}
